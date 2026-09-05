## 1. First: Constraints (so we don’t build nonsense)

> **Historical record — original MVP design.** Vocabulary and endpoints predate
> [`terminology.md`](../../../docs/terminology.md): "Entity" = Codex Entry, `entities` table is now
> `codex_entries`, `/entities` is now `/entries`, and Category was removed in MYT-81.


Ground Rules:

* **Small team = me** → no microservices hell. Start as a well-structured monolith.
* **SaaS, multi-tenant** → user accounts, projects, subscription tiers, data isolation.
* **AI in the loop** → calls to an external LLM provider, need cost control and rate limiting.
* **Image storage** → not in DB, use object storage (S3 or compatible).
* **Global-ish user base** → decent latency, good UX, maybe EU-friendly (we're in France).
* **Eventual payments** → Stripe-based subscription, with webhooks.

These drive the architecture. If we ignore them, we end up rewriting half the app later.

---

## 2. High-Level Architecture (MVP-ready)

5 Main Blocks:

1. **Web App (Frontend)**
   React + Tailwind SPA (or Next.js with server components if we want), talking to:
2. **Backend API** (Single Spring Boot app)

   * Auth
   * Projects & Entities CRUD
   * AI helper endpoints
   * Billing integration
3. **Database**

   * PostgreSQL (multi-tenant via user/project IDs)
4. **Object Storage**

   * S3 (AWS, Wasabi, Backblaze, or MinIO) for images & exports
5. **External Services**

   * Stripe (billing)
   * LLM provider (OpenAI, etc.)
   * Email provider (verification, password reset, notifications)

Everything else is sugar on top.

---

## 3. Backend Architecture (Spring Boot Monolith, but Not Trash)

### 3.1. Modules / Packages

Organize by domain, not only by “controller/service/repository” layers. For example:

* `user` (auth, profiles, sessions)
* `billing` (plans, Stripe integration)
* `project` (worlds / collections)
* `entity` (characters, locations, etc.)
* `storage` (image, export file handling)
* `ai` (all AI-related calls, prompts, caching)
* `shared` (base classes, exceptions, security)

Still use layers *inside* each domain: controller → service → repository, but keep domains clean.

---

### 3.2. Domain Model (Simplified)

Core tables:

* `users`
* `subscriptions` (user_id, plan, status, renew_at)
* `projects` (user_id, name, settings)
* `entities` (project_id, type, title, summary, body, tags, image_url, metadata_json)
* `tags` or just `tags` as string array in `entities`
* `ai_usage_logs` (user_id, project_id, tokens_in/out, cost, feature_used)
* `exports` (entity_id or project_id, type, file_url, created_at)

Important bits:

* **Multi-tenancy** → EVERYTHING links back to `user_id` via project.
* `type` on `entities` → `CHARACTER`, `LOCATION`, `ITEM`, `ORG`, `SPECIES`, `CULTURE`.
* `metadata_json` → flexible per type fields (so we don’t need a new table per entity type yet).

Later, if this grows, we can normalize or split tables. For MVP, one `entities` table + JSON fields = fast development.

---

### 3.3. API Design

Clean, simple REST:

* `POST /auth/register`

* `POST /auth/login`

* `POST /auth/logout`

* `GET /me`

* `GET /projects`

* `POST /projects`

* `GET /projects/{id}`

* `PATCH /projects/{id}`

* `DELETE /projects/{id}`

* `GET /projects/{id}/entities?type=CHARACTER&query=foo&tags=...`

* `POST /projects/{id}/entities`

* `GET /entities/{id}`

* `PATCH /entities/{id}`

* `DELETE /entities/{id}`

* `POST /entities/{id}/image`

* `POST /exports/entities/{id}` (generate PDF/PNG)

* `GET /exports/{id}` (download if authorized)

* `POST /ai/classify-entity`

* `POST /ai/structure-entity`

* `POST /billing/checkout-session`

* `POST /webhooks/stripe`


---

## 4. Frontend Architecture

React (or Next.js) with a modular structure:

* `pages/`

  * `/login`
  * `/register`
  * `/projects`
  * `/projects/:projectId`
  * `/entities/:entityId`
* `components/`

  * `ProjectList`
  * `ProjectSidebar`
  * `EntityCard`
  * `EntityForm`
  * `TagFilter`
  * `AIHelperPanel`
  * `ExportButton`
* `hooks/`

  * `useAuth`
  * `useProject`
  * `useEntities`
* `context/`

  * Auth context
  * Theme (later)
* `lib/api.ts`

  * Axios/fetch wrappers to the backend

Key UX points:

* Clear **Project dashboard** → list entities by type
* **Toggle** between Card View and Data View per entity
* A small **AI helper sidebar** where user can paste text and get structured suggestions

---

## 5. AI Integration: Realistic Concerns

This part can ruin us if we ignore costs and limits. So:

### 5.1. Where AI appears

MVP features:

1. **Classification**: “What kind of thing is this?” → character/species/org/etc.
2. **Structuring**: Turn messy text into a structured object per entity type.

So backend endpoints:

* `POST /ai/classify-entity`

  * request: `{ text }`
  * response: `{ primaryType, possibleTypes: [...], confidence }`

* `POST /ai/structure-entity`

  * request: `{ text, type }`
  * response: `{ fields: { name, role, personality, etc. } }`

### 5.2. Architecture decisions

* Create a dedicated `AiService` that:

  * builds prompts
  * talks to LLM
  * enforces per-user limits
  * logs usage
* No direct frontend → LLM calls. Always via backend (security + control).
* Add **soft quotas** per plan:

  * free: e.g. 50 AI calls / month
  * premium: more / unlimited-ish with rate limiting

### 5.3. Cost + Abuse

* Log every call in `ai_usage_logs`
* Add simple rate limiting (e.g. Bucket4j or Spring filter) based on user + IP
* Optional: re-use responses for same input hashed (local cache)

---

## 6. Storage & Exports

### 6.1. Images

* Use S3-compatible storage:

  * we push: `PUT /upload` from backend, or signed URL from backend to frontend
  * store `image_url` in `entities`
* Consider size limits (e.g. max 3–5 MB/image, limit per user / plan).

### 6.2. Exports

* Backend renders PDFs / PNGs using templates:

  * PDF: something like Flying Saucer / wkhtmltopdf / OpenPDF
  * PNG: generate via HTML-to-image or server-side export
* Exports are stored in `exports` table with `file_url`.
* Cleanup job to delete old exports (they can regenerate).

---

## 7. Auth, Billing, and Multi-Tenancy

### 7.1. Auth

Realistic stack:

* Email + password (MVP)
* JWT-based auth
* Refresh tokens + access tokens
* Later: add Google / GitHub login if needed.

### 7.2. Multi-Tenancy

Nothing fancy.

* Every `project` row has `user_id`
* Every `entity` row has `project_id`
* Every query scoped via user (security filter or manual).

Important:

* Add a **security layer** that *always* checks `user_id` from auth matches resource owner.

### 7.3. Billing

Stripe:

* Products: Free, Pro (maybe later Team)
* Use Checkout + Customer Portal
* Store `stripe_customer_id` in `users`
* Store `stripe_subscription_id`, plan, status, etc. in `subscriptions`
* Stripe webhook endpoint:

  * handles `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, etc.
  * updates plan in DB

The app should read user’s effective plan from our DB, not from Stripe in real-time.

---

## 8. Infra, Deployment, and Dev Workflow

### 8.1. Environments

* `dev` (local)
* `staging` (optional, but helpful)
* `prod`

### 8.2. Hosting

* Frontend: Vercel or Netlify
* Backend: Railway, Render, Fly.io, or small EC2
* DB: managed Postgres (Railway/Neon/Render/AWS RDS)
* Storage: S3/Wasabi/Backblaze

### 8.3. CI/CD

* GitHub Actions:

  * run tests on push
  * build Docker image for backend
  * deploy backend & frontend on main branch merges

---

## 9. Security & Legal-ish Concerns

We’re EU-based, so:

* **GDPR-ish hygiene**:

  * clear privacy policy
  * ability to delete account + data
  * maybe data export endpoint later
* Basic Security:

  * HTTPS only
  * hashed passwords (bcrypt)
  * no tokens in logs
  * sanitize all inputs
* File uploads:

  * validate content-type
  * limit size
  * don’t serve them directly from backend if possible → use signed URLs from S3

---

## 10. “Painpoints From Other Tools” → Architectural Choices

We wanted to explicitly address other tools’ annoying bits:

* **Not bloated**
  → keep domain small: projects + entities only for now
  → do *not* build scenes/chapters editor yet

* **Fast**
  → minimal JS, prefetch data, optimistic UI for saves

* **Not locked-in**
  → exports always available, per-entity & per-project
  → later: full project JSON export

* **Not AI-overbearing**
  → AI endpoints are *optional helpers*, never auto-run
  → UI: “Use AI to suggest fields” as a button, not default.

---

## 11. MVP vs Later

MVP (must have):

* Auth
* Projects
* Entities with 6 types
* Tags + search
* Image upload (1 per entity)
* Card view + data view
* AI classify + structure helper
* Basic export (PDF for entity)
* Basic billing (Free/Pro)

Later:

* Relationship mapping + graphs
* Timelines
* Multiple images / galleries
* Collaboration
* Project-level exports
* Fancy analytics / consistency checking

