# CLAUDE.md — Mytherion (Monorepo Root)

You are working in **Mytherion**, a full-stack worldbuilding and writing platform.
It lets creators define their own codex entry types, manage structured narrative data, and eventually use AI as a precision creative engineering tool.
This is an **active MVP** under ongoing development.

---

## Monorepo Structure

```
mytherion-app/
├── mytherion-backend/    # Spring Boot + Kotlin API
├── mytherion-frontend/   # Next.js + TypeScript UI
├── docs/                 # Architectural plans and design decisions
└── docker-compose.yml    # Full-stack local orchestration
```

Each service has its own `.claude/CLAUDE.md` with service-specific context. This root file covers cross-cutting concerns.

---

## Tech Stack

### Backend (`mytherion-backend/`)
- **Language**: Kotlin
- **Framework**: Spring Boot (latest)
- **DB**: PostgreSQL via Spring Data JPA + Hibernate
- **Migrations**: Flyway (`src/main/resources/db/migration`)
- **Auth**: JWT via httpOnly cookies
- **Object Storage**: MinIO
- **Build**: Gradle (Kotlin DSL)
- **Security**: Spring Security with a `ProjectAccessInterceptor` for tenant isolation

### Frontend (`mytherion-frontend/`)
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **State**: Redux Toolkit (`authSlice`, `projectSlice`)
- **Styling**: Tailwind CSS v4 + custom semantic utilities in `globals.css`
- **HTTP**: Axios with interceptors for JWT and project context
- **Testing**: Jest + React Testing Library

---

## Key Architectural Decisions

### Project-Centric Navigation
All data is scoped to a **Project**. URL hierarchy:
- `/projects` — hub, list of all user projects
- `/projects/[id]` — project dashboard
- `/projects/[id]/codex` — codex entry browser
- `/projects/[id]/timeline` — chronological map

### Security: Tenant Isolation
The `ProjectAccessInterceptor` intercepts all `/api/projects/{projectId}/**` routes and verifies the authenticated user owns that project before any handler runs.

### Entry Sections
Codex entries have a polymorphic section system (`@JsonSubTypes` on backend). The `SectionType` values must stay in sync between backend and frontend. Backend is the source of truth.

### CSS Architecture
Styles follow a tree inheritance model:
- `base.css` — shared tokens, resets, typography
- `auth.css`, `projects.css`, `app-core.css` — context-specific overrides

---

## Local Dev Quickstart

### Full stack (Docker)
```bash
docker compose up -d --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Mailhog: http://localhost:8025
- MinIO: http://localhost:9001

### Backend only
```bash
cd mytherion-backend
docker compose up -d          # Start Postgres
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Frontend only
```bash
cd mytherion-frontend
npm install
npm run dev
```

---

## Cross-Service Rules

- **Never** bypass the `ProjectAccessInterceptor` — all project-scoped endpoints must go through it.
- **Never** edit an already-applied Flyway migration. New schema change = new migration file.
- **Keep `SectionType` in sync** between `EntrySection.kt` and `types/codex.ts`. `EntryType` and `SectionType` must share no value names.
- Code is organized **by domain**, not by layer. Preserve that structure in the backend.
- All frontend API calls must go through the Axios instance in `apiConfig.ts` — never use raw `fetch` for authenticated requests.

---

## Active Plans & Docs

See [`docs/`](../docs/README.md) for the current architectural plans:
- Navigation overhaul (project-centric URL hierarchy)
- Component architecture (entry section coupling workflow)
- CSS architecture (modular style tree)
- Design system (semantic typography utilities)
- CI/environment fixes

---

## What to Do When Unsure
- Check `docs/README.md` for open decisions and backlog.
- Re-read the service-specific `.claude/CLAUDE.md` for the area you're working in.
- Inspect existing patterns in the codebase before introducing new abstractions.
- If touching persistence: read the existing Flyway migrations first.

## Terminology
`docs/terminology.md` is the canonical vocabulary and wins over the code. `Entity`, `Component`
(as a domain term) and `World` are banned — use `CodexEntry`, `EntrySection` and `Project`.

## Licensing
This project is currently **not licensed for redistribution**.
