# Entry Management Setup Guide

## Prerequisites

- Java 24
- Docker & Docker Compose
- PostgreSQL 17 (via Docker)
- MinIO (via Docker)
- MailHog (via Docker)

---

## Quick Start

### 1. Clone and Setup

```bash
cd mytherion-backend
```

### 2. Start Services

```bash
docker-compose up -d
```

This starts:

- **PostgreSQL** on port 5432
- **MailHog** on ports 1025 (SMTP) and 8025 (UI)
- **MinIO** on ports 9000 (API) and 9001 (Console)

### 3. Verify Services

**PostgreSQL:**

```bash
docker exec -it mytherion_postgres psql -U mytherion -d mytheriondb
```

**MinIO Console:**

- URL: http://localhost:9001
- Login: minioadmin / minioadmin

**MailHog UI:**

- URL: http://localhost:8025

### 4. Build and Run Backend

```bash
./gradlew build
./gradlew bootRun
```

Backend will start on http://localhost:8080

### 5. Verify Database Migrations

Check that all migrations ran successfully:

```sql
SELECT version, description, installed_on
FROM flyway_schema_history
ORDER BY installed_rank;
```

Expected migrations:

- V1: Initial tables
- V2: User soft delete
- V3: Email verification
- V4: Entry to Entry refactoring
- V5: Project enhancements

---

## Configuration

### Environment Variables

Create `.env` file or set environment variables:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mytheriondb
POSTGRES_USER=mytherion
POSTGRES_PASSWORD=mytherion

# MinIO
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=mytherion-uploads

# Email
MAIL_HOST=localhost
MAIL_PORT=1025

# Frontend
FRONTEND_URL=http://localhost:3001

# Email From
EMAIL_FROM=noreply@mytherion.local
```

### Application Configuration

See `src/main/resources/application.yml` for full configuration.

---

## Database Schema

### Entries Table

```sql
CREATE TABLE entries (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    description TEXT,
    tags TEXT[],
    image_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);
```

### Projects Table

```sql
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    owner BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);
```

---

## MinIO Setup

### Create Bucket (Auto-created on startup)

The application automatically creates the `mytherion-uploads` bucket on startup.

### Manual Bucket Creation

If needed, create manually via MinIO Console:

1. Go to http://localhost:9001
2. Login with minioadmin/minioadmin
3. Click "Create Bucket"
4. Name: `mytherion-uploads`
5. Click "Create"

### Access Policy

The bucket is private by default. Images are accessed via presigned URLs.

---

## Testing

### Run All Tests

```bash
./gradlew test
```

### Run Specific Test Class

```bash
./gradlew test --tests CodexEntryServiceTest
./gradlew test --tests CodexEntryControllerTest
```

### Test Coverage

```bash
./gradlew jacocoTestReport
```

Report will be in `build/reports/jacoco/test/html/index.html`

---

## API Testing with cURL

### Create a Test User (Manual)

```sql
INSERT INTO users (username, email, password, email_verified, created_at, updated_at)
VALUES ('testuser', 'test@example.com', '$2a$10$...', true, NOW(), NOW());
```

### Create a Test Project

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "A test project"
  }'
```

### Create an Entry

```bash
curl -X POST http://localhost:8080/api/projects/1/entries \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CHARACTER",
    "name": "Test Character",
    "summary": "A test character",
    "tags": ["test", "hero"]
  }'
```

### List Entries

```bash
curl http://localhost:8080/api/projects/1/entries
```

---

## Troubleshooting

### Database Connection Issues

Check PostgreSQL is running:

```bash
docker ps | grep postgres
```

Check connection:

```bash
docker exec -it mytherion_postgres psql -U mytherion -d mytheriondb
```

### MinIO Connection Issues

Check MinIO is running:

```bash
docker ps | grep minio
```

Check MinIO logs:

```bash
docker logs mytherion_minio
```

### Migration Failures

Reset database (CAUTION: Deletes all data):

```bash
docker-compose down -v
docker-compose up -d
```

### Build Errors

Clean and rebuild:

```bash
./gradlew clean build
```

---

## Production Deployment

### Switch to S3

1. Create S3 bucket
2. Update `application.yml`:

```yaml
# Replace MinIO config with S3
aws:
  s3:
    endpoint: https://s3.amazonaws.com
    access-key: ${AWS_ACCESS_KEY}
    secret-key: ${AWS_SECRET_KEY}
    bucket-name: ${S3_BUCKET}
    region: us-east-1
```

3. Implement S3StorageService (same interface as MinIOStorageService)

### Environment Variables

Set production environment variables:

- Database credentials
- S3 credentials
- Email provider (replace MailHog)
- JWT secret (strong random value)
- Frontend URL

### Database Migrations

Flyway will automatically run migrations on startup.

---

## Next Steps

1. **Frontend Integration** - Connect React/Next.js frontend
2. **Authentication** - Implement proper JWT auth (currently uses demo user)
3. **Image Optimization** - Add image resizing/compression
4. **Search Enhancement** - Implement full-text search with PostgreSQL
5. **Caching** - Add Redis for performance
6. **Monitoring** - Add logging and metrics
