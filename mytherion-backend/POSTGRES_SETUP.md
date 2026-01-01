# PostgreSQL Docker Configuration

This document explains how to set up and use the PostgreSQL database with Docker for the Mytherion application.

## Quick Start

1. **Run the setup script** (Windows PowerShell):

   ```powershell
   .\setup-postgres.ps1
   ```

   Or manually create the files:

   - Copy `.env.example` to `.env`
   - Ensure `secrets/pg_user.txt` contains: `mytherion`
   - Ensure `secrets/pg_pw.txt` contains: `mytherion`

2. **Start PostgreSQL**:

   ```bash
   docker-compose up -d
   ```

3. **Verify the database**:

   ```bash
   docker exec -it postgres psql -U mytherion -d mytherion
   ```

4. **Run the application**:
   ```bash
   ./gradlew bootRun
   ```

## Configuration Details

### Environment Variables

The application uses the following environment variables (defined in `.env`):

| Variable            | Default     | Description       |
| ------------------- | ----------- | ----------------- |
| `POSTGRES_HOST`     | `localhost` | Database host     |
| `POSTGRES_PORT`     | `5432`      | Database port     |
| `POSTGRES_DB`       | `mytherion` | Database name     |
| `POSTGRES_USER`     | `mytherion` | Database username |
| `POSTGRES_PASSWORD` | `mytherion` | Database password |

### Docker Compose

The `docker-compose.yml` file:

- Uses PostgreSQL 17.4
- Exposes port 5432
- Stores data in `./data` directory
- Uses secrets from `./secrets/` directory
- Supports environment variable overrides via `.env` file

### Spring Boot Configuration

The `application.yml` uses environment variables with sensible defaults:

- Connection URL: `jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:mytherion}`
- HikariCP connection pool configured for production use

## Troubleshooting

### Connection Refused

If you get "Connection refused", ensure:

1. Docker container is running: `docker ps | grep postgres`
2. Port 5432 is not already in use
3. Environment variables match between Docker and application

### Database Does Not Exist

If you get "database does not exist":

1. Stop the container: `docker-compose down`
2. Remove the data directory: `rm -rf data/`
3. Restart: `docker-compose up -d`

### Authentication Failed

Ensure the credentials in `secrets/` match the `.env` file:

- `secrets/pg_user.txt` should contain: `mytherion`
- `secrets/pg_pw.txt` should contain: `mytherion`

## Production Considerations

For production deployment:

1. **Change default credentials** - Update both secrets files and `.env`
2. **Use strong passwords** - Generate secure random passwords
3. **Enable SSL** - Uncomment SSL configuration in `docker-compose.yml`
4. **Use external secrets management** - Consider HashiCorp Vault, AWS Secrets Manager, etc.
5. **Backup strategy** - Implement regular database backups
6. **Monitor connections** - Enable logging and monitoring

## File Structure

```
mytherion/
├── .env                    # Environment variables (not in git)
├── .env.example            # Template for .env
├── docker-compose.yml      # Docker configuration
├── setup-postgres.ps1      # Setup script
├── secrets/                # Database credentials (not in git)
│   ├── pg_user.txt
│   └── pg_pw.txt
├── data/                   # PostgreSQL data (not in git)
└── logs/                   # PostgreSQL logs (not in git)
```
