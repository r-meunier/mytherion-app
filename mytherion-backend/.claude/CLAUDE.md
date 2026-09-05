# CLAUDE.md — Mytherion Backend (Spring Boot + Kotlin)

You are working in **Mytherion Backend**, a Spring Boot + Kotlin service for a lightweight worldbuilding / codex-style app.
It provides structured storage for **projects** and their **codex entries** (characters, locations, cultures, etc.), and is an early MVP under active development.

## What matters most (guardrails)
- This is **early MVP / active development**: schemas and migrations may change; DB resets are expected.
- **Flyway migrations are source of truth** for schema. Do not “just tweak the DB”.
- Code is organized **by domain**, not by layers. Preserve that structure.
- Keep API design **clear and evolvable**; avoid premature optimization.

## Tech stack (current)
- Kotlin + Spring Boot
- Spring Data JPA (Hibernate)
- Flyway migrations
- PostgreSQL
- Docker / Docker Compose for local infra
- Gradle (Kotlin DSL)

## Local dev quickstart
### Prereqs
- JDK 17 or 21
- Docker + Docker Compose

### Run locally
1) Copy env:
```bash
cp .env.example .env
```

2) Start Postgres:
```bash
docker compose up -d
```

3) Run the app:
```bash
./gradlew bootRun
```

4) Verify:
- `GET http://localhost:8080/api/health`
- Expected:
```json
{ "status": "OK", "app": "Mytherion" }
```

### Reset database (expected during MVP)
This project uses a bind-mounted Postgres data directory. To fully reset:
1) `docker compose down`
2) Delete contents of `data/`
3) `docker compose up -d`

Flyway will re-run migrations on startup.

## Database migrations (Flyway)
- Location: `src/main/resources/db/migration`
- Rules:
  - Migrations run once per database
  - **Do not edit** an already-applied migration
  - New schema change = new migration (`V2__...`, `V3__...`, etc.)
  - In early dev it’s acceptable to wipe local DB

## Code layout (high-level)
Root package:
`src/main/kotlin/io/mytherion`

Business domains — each holds its own `model`, `dto`, `repository`, `service`, `rest`, `exception`:
- `user` — user domain
- `project` — projects (plus `security/ProjectAccessInterceptor`)
- `codex` — codex entries (`CodexEntry`) and their sections
- `dashboard` — aggregate stats
- `auth` — authentication (`rest`, `service`, `jwt`, `model`, `repository`, `dto`, `util`)

Supporting packages:
- `common` — shared kernel: `exception/ApiException`, `web/ErrorResponse`, `model/AbstractAuditableEntity`. Depends on nothing.
- `platform` — infrastructure: `email`, `storage`, `logging`, `monitoring`, `health`
- `config` — wiring only: Security, WebMvc, Password, `web/GlobalExceptionHandler`
- `MytherionApplication.kt` — app entrypoint

Dependency rule: `domain → common` and `domain → platform` are fine; `common` depends on
nothing; `platform` must not depend on a business domain. These are enforced by ArchUnit in
`src/test/kotlin/io/mytherion/architecture/PackageStructureTest.kt` — a violation fails the build.

### When adding a feature
Prefer this flow:
1) Identify the domain (`project`, `codex`, `user`, etc.)
2) Add/extend JPA entity + repository + service + controller inside the same domain package,
   putting the controller in that domain's `rest/` package
3) Add a Flyway migration for schema changes
4) Update/extend endpoints under the existing `/api/...` pattern (health is `/api/health`)

### Errors
Client-facing errors extend `common.exception.ApiException` and declare their own
`HttpStatus` and error label. `GlobalExceptionHandler` then renders them generically, so a new
domain exception needs **no** change to shared code. Leave genuine infrastructure failures as
plain exceptions — they fall through to the generic handler, which logs the cause and returns a
masked 500 rather than leaking internals.

### Tests
- `./gradlew test` — fast tests only (unit + `@WebMvcTest` slices)
- `./gradlew integrationTest` — classes marked `@IntegrationTest`; needs a database
- `./gradlew check` — both; this is what CI runs

## Current vs planned features (context)
Current:
- Postgres schema managed via Flyway
- Project creation/listing, search and stats
- Codex entry CRUD with a polymorphic section system
- Tagging/search
- Auth (JWT via httpOnly cookies) and email verification
- Image uploads via MinIO
- Tenant isolation through `ProjectAccessInterceptor`
- Health endpoint
- Dockerized local DB

Planned (don’t implement unless asked):
- Relationship mapping
- Export (PDF/image)
- AI-assisted structuring tools

## Quality bar / change discipline
- Keep changes small and readable.
- Prefer simple, predictable Spring idioms.
- Avoid introducing new frameworks unless clearly required.
- Any schema change must be accompanied by a Flyway migration.
- Don’t refactor package structure into “controller/service/repository” layers; keep domain-first.

## What to do when unsure
If you’re missing context:
- Re-read `README.md` (setup, conventions, endpoints).
- Check existing domain packages for patterns (how controllers/services/repos are organized).
- If a change touches persistence, inspect existing Flyway migrations first.

## Licensing note
This project is currently **not licensed for redistribution**.

## Terminology
`docs/terminology.md` is the canonical vocabulary and wins over the code. `Entity`, `Component`
(as a domain term) and `World` are banned words — use `CodexEntry`, `EntrySection` and `Project`.
