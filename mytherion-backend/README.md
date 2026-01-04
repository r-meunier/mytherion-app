# Mytherion Backend

Mytherion is the backend service for a lightweight worldbuilding and codex-style application.
It provides structured storage for projects, entries (characters, locations, cultures, etc.),
and lays the groundwork for future features such as relationships, exports, and AI-assisted tools.

This repository contains the **Spring Boot + Kotlin backend**, database migrations, and local
development setup.

---

## Tech Stack

- **Kotlin**
- **Spring Boot**
- **Spring Data JPA (Hibernate)**
- **Flyway** – database migrations
- **PostgreSQL**
- **Docker / Docker Compose** – local infrastructure
- **Gradle (Kotlin DSL)**

---

## Project Status

⚠️ **Early MVP / Active Development**

- Schema and migrations may change
- Authentication is not finalized yet
- Data reset during development is expected

---

## Prerequisites

You need the following installed:

- **JDK 17 or 21**
- **Docker**
- **Docker Compose**
- (Optional) IntelliJ IDEA

---

## Local Development Setup

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

Adjust values if needed. Defaults are suitable for local development.

---

### 3. Start PostgreSQL

The database is run via Docker Compose.

```bash
docker compose up -d
```

⚠️ **Important note about persistence**

This project uses a **bind-mounted Postgres data directory**.
If you need a completely clean database during development:

1. Stop containers:
   ```bash
   docker compose down
   ```
2. Delete the contents of the `data/` directory
3. Restart:
   ```bash
   docker compose up -d
   ```

Flyway will re-run migrations on startup.

---

### 4. Run the application

#### Option A: via Gradle
```bash
./gradlew bootRun
```

#### Option B: via IntelliJ
Run `MytherionApplication.kt`

---

### 5. Verify it’s running

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

- Migrations run **once per database**
- **Do not edit** a migration that has already been applied
- New schema changes → create a new migration (`V2__`, `V3__`, etc.)
- During early development, it is acceptable to wipe the local DB

Flyway tracks applied migrations in the `flyway_schema_history` table.

---

## Project Structure (simplified)

```
src/main/kotlin/io/mytherion
├── config        # Security, Flyway, app config
├── health        # Health check endpoint
├── user          # User domain
├── project       # Projects (worlds)
├── entry         # Codex entries (characters, locations, etc.)
└── MytherionApplication.kt
```

---

## Current Features

- PostgreSQL schema managed via Flyway
- Project creation and listing
- Entry model groundwork (characters, locations, etc.)
- Health endpoint
- Dockerized local database

---

## Planned Features

- Authentication (JWT)
- Entry CRUD endpoints
- Tagging and search
- Image uploads
- Relationship mapping
- Export (PDF / image)
- AI-assisted structuring tools

---

## Development Notes

- This is a **backend-first MVP**
- API design prioritizes clarity and evolution over premature optimization
- The codebase is intentionally structured by domain, not layers

---

## License

This project is currently not licensed for redistribution.
