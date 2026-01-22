# Mytherion Backend

Mytherion is the backend service for a lightweight worldbuilding and codex-style application.
It provides structured storage for projects, entities (characters, locations, cultures, etc.),
image management, email verification, and comprehensive performance monitoring.

This repository contains the **Spring Boot + Kotlin backend**, database migrations, and local
development setup.

---

## Tech Stack

- **Kotlin 2.2.21**
- **Spring Boot 4.0.1**
- **Spring Data JPA (Hibernate)**
- **Spring Security** – JWT-based authentication
- **Spring Boot Actuator** – Operational metrics and monitoring
- **Micrometer + Prometheus** – Performance metrics collection
- **Spring Mail** – Email verification system
- **Flyway** – Database migrations
- **PostgreSQL** – Primary database
- **MinIO** – Object storage for images
- **Docker / Docker Compose** – Local infrastructure
- **Gradle (Kotlin DSL)** – Build tool
- **JUnit 5 + MockK** – Testing framework

---

## Project Status

✅ **Production-Ready MVP**

- Core authentication with JWT httpOnly cookies
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

You need the following installed:

- **JDK 17 or newer** (project uses JDK 24)
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

### 3. Start PostgreSQL and MinIO

The database and object storage are run via Docker Compose.

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

Actuator metrics:

```
GET http://localhost:8080/actuator/health
GET http://localhost:8080/actuator/metrics
GET http://localhost:8080/actuator/prometheus
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

- **JWT-based authentication** with httpOnly cookies
- **User registration** with email and password validation
- **Login/logout** with session persistence
- **Email verification** via token-based links
- **Secure password hashing** (BCrypt)
- **CSRF protection** (SameSite=Strict cookies)
- **Session restoration** on page refresh

### Project Management

- **Project CRUD operations** (Create, Read, Update, Delete)
- **Soft delete** functionality
- **User-scoped projects** with ownership verification
- **Project statistics** (entity counts by type)
- **Pagination support**

### Entity Management

Supports **6 entity types**:

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

See [PERFORMANCE_MONITORING.md](docs/PERFORMANCE_MONITORING.md) for detailed setup.

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

The application includes comprehensive performance monitoring:

### Metrics Available

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

# Specific metric
curl http://localhost:8080/actuator/metrics/http.server.requests

# Prometheus format
curl http://localhost:8080/actuator/prometheus
```

### Monitoring Stack (Optional)

For production monitoring, see [PERFORMANCE_MONITORING.md](docs/PERFORMANCE_MONITORING.md) for:

- Prometheus + Grafana setup
- Pre-built dashboards
- Alerting rules
- Docker Compose configuration

---

## Planned Features

### Short-term

- Password reset flow
- Two-factor authentication (2FA)
- User profile updates
- Project sharing/collaboration
- Advanced entity search

### Medium-term

- Relationship mapping between entities
- Rich text editor for descriptions
- Export functionality (PDF, JSON)
- Tagging system enhancements
- Bulk operations

### Long-term

- AI-assisted content generation
- Graph visualization of relationships
- Version history for entities
- Real-time collaborative editing
- Advanced analytics and insights

---

## Development Notes

### Code Style

- **Kotlin** with idiomatic patterns
- **Functional programming** where appropriate
- **Immutability** preferred for DTOs
- **Null safety** enforced by Kotlin

### Best Practices

- Domain-driven design
- Separation of concerns
- Dependency injection via Spring
- Validation at API boundary
- Comprehensive error handling
- Structured logging throughout

### Performance

- Connection pooling (HikariCP)
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

Ensure PostgreSQL is running:

```bash
docker compose ps
```

Check connection:

```bash
docker compose exec postgres psql -U mytherion_user -d mytherion
```

### MinIO Connection Issues

Verify MinIO is running:

```bash
curl http://localhost:9000/minio/health/live
```

Access MinIO console: `http://localhost:9001`

### Migration Failures

Check Flyway history:

```sql
SELECT * FROM flyway_schema_history;
```

Reset database (development only):

```bash
docker compose down
rm -rf data/
docker compose up -d
```

### Performance Issues

Check Actuator metrics:

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

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## Related Repositories

- **Frontend:** [mytherion-frontend](https://github.com/Adelaice7/mytherion-frontend)

---

## Documentation

Additional documentation:

- [Performance Monitoring Guide](docs/PERFORMANCE_MONITORING.md)
- [Authentication Future Features](docs/auth-feature/auth-future-features.md)
- [Manual Testing Checklist](docs/auth-feature/auth-manual-testing-checklist.md)

---

## License

This project is currently not licensed for redistribution.

---

## Support

For issues or questions, please open an issue on GitHub.
