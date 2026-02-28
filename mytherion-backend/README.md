# Mytherion Backend

Mytherion is a worldbuilding (and later, writing) platform built for creators who want to come away from the classic boxes. It gives writers and worldbuilders creative freedom over structure, AI support that works the way coding tools do, and the infrastructure to own their creative work as real, versioned, navigable data.

This repository contains the Spring Boot + Kotlin backend, database migrations, and local development setup.

---

## What is Mytherion?

A lot of writing apps — Scrivener, NovelCrafter, and the rest — share the same flaw: they give you a pre-defined structure and expect your story to fit inside it. When AI gets bolted on, it fires a complex prompt in the background and hopes it picks up the relevant context as you go.

I don't believe in forcing creativity into boxes. And I don't think AI for writing should work any differently to AI for code.

### Three core pillars

#### 1. Creative freedom over structure

Mytherion ships with a default structure — a Codex with entity types like Character, Location, Organization, Culture, Species, and Item, and some pre-defined project genres. These are starting points, not hard requirements.

The goal down the line is to be able to customise everything: custom categories, custom tags, custom metadata fields. If your world has Factions, Deities, Starships, or Arcane Schools, you should be able to define those as first-class entities. The platform should fit the project — not the other way around.

#### 2. AI support that works the way coding tools do

Writing a novel _is_ engineering in its form. An author building a world, defining characters, structuring arcs, plotting narrative threads — it's the same interconnected, multi-file project as a complex codebase.

Coding AI agents handle context differently than their web chat counterparts do. They _go find what's relevant to your current prompt_, on the fly. Ask it to summarise all chapters? It'll pull the chapter files. Ask it to revise a single paragraph? It pulls that section and the context. It dynamically scopes what it needs. That makes a huge difference when you're working on a 50k+ word project across dozens if not hundreds of files.

That's the model Mytherion brings to writing — tools like Claude Code, Cursor, Codex, Gemini CLI. Instead of forcing you to craft elaborate prompts and cross your fingers, the AI should navigate the Codex, read entity definitions, trace relationship threads, and apply it exactly where it matters.

#### 3. Your world is your data — and you should own it

A manuscript, a Codex, a set of interlocking narrative threads — all of it is data. Structured, relational, versioned data. A software project treats version history, diff views, structural navigation, and multi-file continuity as _baseline infrastructure_. A creative project should have exactly the same.

The assumption that writers don't want this, or can't handle it, is wrong. It's not a complexity problem — it's a representation problem, and a matter of trust. Writers already mentally track who said what in Chapter 3, what a character's backstory was in the first draft, whether that subplot ever got resolved. Version history and structural visibility aren't alien concepts. The tooling just hasn't caught up.

Mytherion wants to build that infrastructure: a platform where your creative project is as navigable, recoverable, and structurally visible as a well-maintained codebase. Where no draft is ever truly lost. Writers deserve that level of trust in their tools.

---

## Tech Stack

- **Kotlin 2.2.21**
- **Spring Boot 4.0.1**
- **Spring Data JPA (Hibernate)**
- **Spring Security** (JWT-based authentication)
- **Spring Boot Actuator** (Operational metrics and monitoring)
- **Micrometer + Prometheus**
- **Spring Mail**
- **Flyway**
- **PostgreSQL**
- **MinIO**
- **Docker / Docker Compose**
- **Gradle (Kotlin DSL)**
- **JUnit 5 + MockK**

---

## Project Status

**MVP**

- Authentication with JWT httpOnly cookies
- User registration, login, and email verification
- Project CRUD operations with soft delete
- Entity management (6 entity types with metadata)
- Image upload and storage via MinIO
- Performance monitoring with Actuator + Micrometer
- Comprehensive structured logging
- Unit and integration tests
- Ready for deployment

---

## Prerequisites

- **JDK 17 or newer** (project uses JDK 24)
- **Docker**
- **Docker Compose**

---

## What I Learned

This project was a way for me to practice making backend decisions. A few choices were tradeoffs:

### httpOnly cookies for auth over storing JWTs in localStorage

I used JWTs in httpOnly cookies instead of localStorage because I wanted safety against token theft via XSS. It also helped with browser session handling (cookies are sent automatically).

**Tradeoff:** cookie auth requires more care around CORS/CSRF and local dev setup. Can't just drop a token into an Authorization header everywhere.

### Soft delete for projects (and later entities)

I used soft delete (`deletedAt`) because this app is for creative/worldbuilding content, where accidental deletion is very likely.

**Tradeoff:** soft delete makes queries and uniqueness rules more complex. We need to consistently filter out deleted rows and think about restore behavior and indexing.

### JSONB for entity metadata

Different entity types (character, location, item, etc.) need different fields. JSONB let me move faster without creating many type-specific tables too early and deciding on a hard schema.

**Tradeoff:** this gives flexibility, but needs more validation in code and can make querying/reporting more complex than a fully normalized schema. As the product grows and custom fields become first-class, some fields may need to be promoted into dedicated tables or a proper EAV model.

### Early monitoring/logging

I added Actuator/Micrometer/structured logging early for practicing operability using Prometheus and Grafana. I also wanted to be able to debug performance and request flow as the app grows.

**Tradeoff:** this adds extra setup early in a side project, and not every metric is very useful (yet). But it helped me build better habits.

### What I'd improve next

- Contract tests between frontend and backend (to avoid docs/API drift)
- Stricter API error schema and consistency across endpoints
- Pagination/filtering strategy finalized across list endpoints
- Better validation for JSONB metadata per entity type
- Role-based permissions / project sharing model
- CI checks for formatting/linting/tests to keep repo quality consistent

---

## Local Dev Setup

### 1. Clone the repository

```bash
git clone https://github.com/Adelaice7/mytherion-backend.git
cd mytherion-backend
```

---

### 2. Environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

---

### 3. Start PostgreSQL and MinIO

```bash
docker compose up -d
```

---

### 4. Run the application

#### Option A: via Gradle

```bash
./gradlew bootRun
```

#### Option B: via IntelliJ

Run `MytherionApplication.kt`

---

### 5. Verify it's running

Health endpoint:

```
GET http://localhost:8080/api/health
```

Expected response:

```json
{
  "status": "OK",
  "app": "Mytherion"
}
```

---

## Database Migrations (Flyway)

Migrations are located in:

```
src/main/resources/db/migration
```

### Important rules

- Migrations run once per database
- New schema changes → create a new migration (`V2__`, `V3__`, etc.)

Flyway tracks applied migrations in the `flyway_schema_history` table.

---

## Project Structure

```
src/main/kotlin/io/mytherion
├── config/           # Security, CORS, WebMvc, Flyway config
├── logging/          # Structured logging extensions
├── monitoring/       # Performance interceptor, metrics
├── health/           # Health check endpoint
├── auth/             # Authentication (JWT, cookies)
├── user/             # User domain (registration, profile)
├── email/            # Email verification service
├── project/          # Projects (worlds) domain
├── entity/           # Codex entities (characters, locations, etc.)
├── storage/          # MinIO image storage service
└── MytherionApplication.kt
```

---

## Current Features

### Authentication System

- **JWT-based authentication** (httpOnly cookies)
- **User registration** (email + password validation)
- **Login/logout** (session persistence)
- **Email verification** (token-based links)
- **Secure password hashing** (BCrypt)
- **CSRF protection** (SameSite=Strict cookies)
- **Session restoration** (page refresh)

### Project Management

- **Project CRUD operations** (Create, Read, Update, Delete)
- **Soft delete**
- **User-scoped projects** with ownership verification
- **Project statistics** (entity counts by type)
- **Pagination support**

### Entity Management (Codex)

Support for 6 built-in entity types (the defaults — more to come):

- **CHARACTER** – Age, role, personality traits
- **LOCATION** – Region, climate, population
- **ORGANIZATION** – Type, leader, founded date
- **SPECIES** – Lifespan, traits, habitat
- **CULTURE** – Language, traditions, values
- **ITEM** – Origin, purpose, rarity

**Features:**

- Full CRUD operations for all entity types
- **Type-specific metadata** stored as JSONB
- **Tag system** using PostgreSQL arrays
- **Search and filtering** by type, tags, name
- **Soft delete** with `deletedAt` timestamp
- **Image support** via MinIO storage
- **Pagination** for large datasets

### Image Storage

- **MinIO object storage** integration
- **Image upload** for entities and projects
- **URL generation** for stored images
- **File validation** (type, size)

### Performance Monitoring

- **Spring Boot Actuator** endpoints
- **Micrometer metrics** collection
- **Prometheus-compatible** metrics export
- **Performance interceptor** for request timing
- **Structured logging** with execution timing
- **MDC request correlation** IDs
- **Health checks** and readiness probes

### Database

- **PostgreSQL** schema managed via Flyway
- **JSONB** for flexible entity metadata
- **PostgreSQL arrays** for tags
- **Soft delete pattern** across entities
- **Dockerized** local database

### API

- **RESTful API** design
- **Health endpoint** (`/api/health`)
- **Actuator endpoints** (`/actuator/*`)
- **CORS configuration** for frontend integration
- **Validation** with Spring Validation
- **Error handling** with custom exceptions

---

## API Endpoints

### Authentication

| Endpoint                  | Method | Description              |
| ------------------------- | ------ | ------------------------ |
| `/api/auth/register`      | POST   | Register new user        |
| `/api/auth/login`         | POST   | Login user               |
| `/api/auth/logout`        | POST   | Logout user              |
| `/api/auth/me`            | GET    | Get current user         |
| `/api/auth/verify-email`  | GET    | Verify email via token   |
| `/api/auth/resend-verify` | POST   | Resend verification link |

### Projects

| Endpoint                   | Method | Description          |
| -------------------------- | ------ | -------------------- |
| `/api/projects`            | GET    | List user's projects |
| `/api/projects`            | POST   | Create new project   |
| `/api/projects/{id}`       | GET    | Get project details  |
| `/api/projects/{id}`       | PUT    | Update project       |
| `/api/projects/{id}`       | DELETE | Soft delete project  |
| `/api/projects/{id}/stats` | GET    | Get project stats    |

### Entities

| Endpoint               | Method | Description              |
| ---------------------- | ------ | ------------------------ |
| `/api/entities`        | GET    | List entities (filtered) |
| `/api/entities`        | POST   | Create new entity        |
| `/api/entities/{id}`   | GET    | Get entity details       |
| `/api/entities/{id}`   | PUT    | Update entity            |
| `/api/entities/{id}`   | DELETE | Soft delete entity       |
| `/api/entities/search` | POST   | Advanced search          |

### Storage

| Endpoint                  | Method | Description    |
| ------------------------- | ------ | -------------- |
| `/api/storage/upload`     | POST   | Upload image   |
| `/api/storage/{filename}` | GET    | Retrieve image |
| `/api/storage/{filename}` | DELETE | Delete image   |

### Monitoring

| Endpoint                     | Method | Description              |
| ---------------------------- | ------ | ------------------------ |
| `/actuator/health`           | GET    | Health check             |
| `/actuator/metrics`          | GET    | Available metrics        |
| `/actuator/metrics/{metric}` | GET    | Specific metric          |
| `/actuator/prometheus`       | GET    | Prometheus scrape format |

---

## Architecture Decisions

### Domain-Driven Structure

Code is organized by **feature/domain**, not by layer:

- Each domain has its own controller, service, repository, DTOs
- Promotes cohesion and makes features easier to locate
- Reduces coupling between unrelated features

### Soft Delete Pattern

All entities use soft delete (`deletedAt` timestamp):

- Preserves data for audit trails
- Allows "undo" functionality
- Queries filter out deleted records by default

### JSONB Metadata

Entity-specific fields stored as JSONB:

- Flexible schema for different entity types
- No need for separate tables per type
- Easy to add new fields without migrations
- PostgreSQL provides efficient JSONB querying
- Lays groundwork for fully custom user-defined fields

### Structured Logging

Custom logging extensions in `LoggingExtensions.kt`:

- `logger.infoWith()` for structured key-value logging
- `logger.measureTime()` for execution timing
- MDC for request correlation
- JSON-formatted logs for easy parsing

### httpOnly Cookie Authentication

JWT stored in httpOnly cookies:

- Protection against XSS attacks
- Automatic cookie handling by browsers
- SameSite=Strict for CSRF protection
- No token storage in localStorage

---

## Testing

### Running Tests

```bash
./gradlew test
```

### Test Structure

- **Unit tests** for services and repositories
- **Integration tests** for controllers
- **MockK** for mocking dependencies
- **Spring Boot Test** for integration testing
- **JUnit 5** as test framework

### Test Coverage

- Authentication flows
- Project CRUD operations
- Entity management
- Email verification
- Soft delete behavior

---

## Performance Monitoring

### Metrics

- **HTTP request metrics** (count, duration, percentiles)
- **JVM metrics** (memory, GC, threads)
- **Database metrics** (connection pool, query timing)
- **Custom business metrics** (project creation, entity queries)

### Accessing Metrics

```bash
# Health check
curl http://localhost:8080/actuator/health

# All metrics
curl http://localhost:8080/actuator/metrics

# Prometheus format
curl http://localhost:8080/actuator/prometheus
```

---

## Further Planned Features

### Short-term

- Password reset flow
- Two-factor authentication (2FA)
- User profile updates
- Project sharing/collaboration
- Advanced entity search

### Medium-term

- **Custom entity categories** — user-defined types beyond the 6 defaults
- **Custom metadata fields** — define your own fields per entity type
- **Custom tags** — full tag taxonomy ownership
- Relationship mapping between entities
- Rich text editor support for entity descriptions
- Export functionality (PDF, JSON, Markdown)
- Bulk operations

### Long-term

**Version history and structural infrastructure**

Before AI can be genuinely useful at scale, the underlying data model needs to be right. That means treating every entity, chapter, and narrative thread as versioned, diffable, structurally navigable content. The goal is to build the same baseline infrastructure a software project takes for granted: history, recovery, visibility, and coherence across the whole project graph.

**AI Layer**

The AI layer is modeled on how coding agents work. Instead of static prompts and full-context document dumps, it should:

- **Navigate the Codex** — find relevant entities by type, tag, or relationship before responding
- **Scope context dynamically** — pull only what's needed for the current request (a character's sheet, a chapter section, a location's lore) rather than sending everything at once
- **Make targeted edits** — revise a specific paragraph, add a detail to one entity, without touching unrelated content
- **Respect project structure** — understand that a 100k-word novel across 200 Codex entries is a project graph, not a flat document
- **Work with version history** — understand what changed, when, and why, and use that as context

This is the model that makes AI actually useful at scale. The same principles that let Claude Code handle a large codebase apply directly to a complex fictional world.

---

## Dev Notes

### Code Style

- **Kotlin**
- **Immutability** preferred for DTOs
- **Null safety**

### Best Practices

- DDD
- Separation of concerns
- Dependency injection
- Validation at API boundary
- Comprehensive error handling
- Structured logging

### Performance

- Connection pooling
- Lazy loading for relationships
- Pagination for large datasets
- Database indexing on foreign keys
- Efficient JSONB queries

---

## Environment Variables

| Variable            | Description              | Default                 |
| ------------------- | ------------------------ | ----------------------- |
| `DATABASE_URL`      | PostgreSQL connection    | `localhost:5432`        |
| `DATABASE_NAME`     | Database name            | `mytherion`             |
| `DATABASE_USER`     | Database username        | `mytherion_user`        |
| `DATABASE_PASSWORD` | Database password        | `mytherion_pass`        |
| `JWT_SECRET`        | JWT signing key          | (generate secure key)   |
| `JWT_EXPIRATION`    | Token expiration (ms)    | `86400000` (24 hours)   |
| `MINIO_ENDPOINT`    | MinIO server URL         | `http://localhost:9000` |
| `MINIO_ACCESS_KEY`  | MinIO access key         | `minioadmin`            |
| `MINIO_SECRET_KEY`  | MinIO secret key         | `minioadmin`            |
| `MAIL_HOST`         | SMTP server host         | `smtp.gmail.com`        |
| `MAIL_PORT`         | SMTP server port         | `587`                   |
| `MAIL_USERNAME`     | Email account username   | -                       |
| `MAIL_PASSWORD`     | Email account password   | -                       |
| `FRONTEND_URL`      | Frontend application URL | `http://localhost:3000` |

---

## Troubleshooting

### Database Connection Issues

```bash
docker compose ps
```

```bash
docker compose exec postgres psql -U mytherion_user -d mytherion
```

### MinIO Health Check

```bash
curl http://localhost:9000/minio/health/live
```

Access MinIO console: `http://localhost:9001`

### Migration Failures

Check Flyway history:

```sql
SELECT * FROM flyway_schema_history;
```

### Performance Issues

```bash
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

Enable SQL logging in `application.yml`:

```yaml
logging:
  level:
    org.hibernate.SQL: DEBUG
```

---

## Contributing

This is a personal project for now.

---

## Related Repositories

- **Frontend:** [mytherion-frontend](https://github.com/r-meunier/mytherion-frontend)

---

## License

This project is currently not licensed for redistribution.

---

## Support

For issues or questions, please open an issue on GitHub.
