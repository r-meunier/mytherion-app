# Backend Logging Guide

## Overview

The Mytherion backend uses a structured logging system built on SLF4J with Kotlin extensions that provide:

- **Structured logging** with context
- **MDC (Mapped Diagnostic Context)** for request correlation
- **Execution timing** and performance monitoring
- **Function tracing** for debugging
- **Colored console output** for development

---

## Basic Usage

### Getting a Logger

```kotlin
import io.mytherion.platform.logging.logger

class MyService {
    private val logger = logger()  // Kotlin extension

    fun doSomething() {
        logger.info("Doing something")
    }
}
```

### Simple Logging

```kotlin
logger.debug("Debug message")
logger.info("Info message")
logger.warn("Warning message")
logger.error("Error message", exception)
```

---

## Structured Logging

### Log with Context

Use the `*With` extension functions to add structured context to your logs:

```kotlin
import io.mytherion.platform.logging.infoWith
import io.mytherion.platform.logging.errorWith

// Info with context
logger.infoWith(
    "User logged in",
    "userId" to user.id,
    "username" to user.username,
    "ipAddress" to request.remoteAddr
)

// Error with context and exception
logger.errorWith(
    "Failed to create project",
    exception,
    "userId" to user.id,
    "projectName" to projectName
)
```

**Output:**

```
2026-01-19 19:49:00.123 [INFO] [a1b2c3d4] [http-nio-8080-exec-1] io.mytherion.project.service.ProjectService - User logged in | userId=123, username=john_doe, ipAddress=127.0.0.1
```

---

## Advanced Features

### Execution Timing

Measure and log execution time automatically:

```kotlin
import io.mytherion.platform.logging.measureTime
import io.mytherion.platform.logging.LogLevel

val result = logger.measureTime("Database query", LogLevel.DEBUG) {
    repository.findAll()
}
```

**Output:**

```
[DEBUG] Database query completed | duration_ms=45
```

### Function Tracing

Automatically log function entry/exit:

```kotlin
import io.mytherion.platform.logging.traced

fun processUser(userId: Long) = logger.traced("processUser", "userId" to userId) {
    // Function logic here
    val user = userRepository.findById(userId)
    // ...
    user
}
```

**Output:**

```
[DEBUG] Entering processUser | userId=123
[DEBUG] Exiting processUser | userId=123
```

---

## Request Correlation

The `RequestLoggingFilter` automatically adds request context to MDC:

- **requestId**: Unique UUID for each request
- **method**: HTTP method (GET, POST, etc.)
- **path**: Request URI
- **remoteAddr**: Client IP address

All logs within a request will include the `requestId` for correlation.

**Example:**

```
[INFO] [a1b2c3d4-5678-90ab-cdef-1234567890ab] Incoming request | method=POST, path=/api/projects
[DEBUG] [a1b2c3d4-5678-90ab-cdef-1234567890ab] Creating project | userId=123, name=My Project
[INFO] [a1b2c3d4-5678-90ab-cdef-1234567890ab] Request completed | status=201, duration_ms=156
```

---

## Service Example

### Before (Basic Logging)

```kotlin
@Service
class EntityService(
    private val entityRepository: EntityRepository
) {
    private val logger = LoggerFactory.getLogger(EntityService::class.java)

    fun createEntity(projectId: Long, request: CreateEntityRequest): EntityDTO {
        val entity = Entity(/* ... */)
        val saved = entityRepository.save(entity)
        logger.info("Created entity: ${saved.id} in project: $projectId")
        return EntityDTO.from(saved)
    }
}
```

### After (Structured Logging)

```kotlin
@Service
class EntityService(
    private val entityRepository: EntityRepository
) {
    private val logger = logger()  // Kotlin extension

    fun createEntity(projectId: Long, request: CreateEntityRequest): EntityDTO {
        logger.infoWith(
            "Creating entity",
            "projectId" to projectId,
            "type" to request.type,
            "name" to request.name
        )

        val entity = logger.measureTime("Save entity") {
            val entity = Entity(/* ... */)
            entityRepository.save(entity)
        }

        logger.infoWith(
            "Entity created successfully",
            "entityId" to entity.id,
            "projectId" to projectId,
            "name" to entity.name
        )

        return EntityDTO.from(entity)
    }
}
```

---

## MDC Context

### Adding Custom Context

```kotlin
import org.slf4j.MDC

fun processProject(projectId: Long) {
    MDC.put("projectId", projectId.toString())
    try {
        // All logs here will include projectId
        logger.info("Processing project")
        // ...
    } finally {
        MDC.remove("projectId")
    }
}
```

### Using withContext

The logging extensions automatically manage MDC context:

```kotlin
logger.infoWith(
    "Processing entities",
    "projectId" to projectId,
    "userId" to userId
)
// MDC is automatically cleaned up after the log call
```

---

## Configuration

### Log Levels

Configure in `application.yml` or `application.properties`:

```yaml
logging:
  level:
    root: INFO
    io.mytherion: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
```

### Console Pattern

The logging pattern includes:

- Timestamp
- Log level (colored)
- Request ID (from MDC)
- Thread name
- Logger name
- Message
- Additional MDC context (userId, projectId, entityId)

---

## Best Practices

### ✅ Do

- Use structured logging with context
- Log important business events (user actions, state changes)
- Log errors with full context and exceptions
- Use appropriate log levels
- Measure performance of critical operations

```kotlin
logger.infoWith(
    "User registered",
    "userId" to user.id,
    "email" to user.email
)

logger.errorWith(
    "Payment processing failed",
    exception,
    "userId" to user.id,
    "amount" to amount,
    "currency" to currency
)
```

### ❌ Don't

- Log sensitive information (passwords, tokens, credit cards)
- Log excessively in tight loops
- Use string concatenation in log messages
- Forget to include context for errors
- Log PII without sanitization

```kotlin
// ❌ Bad
logger.info("User ${user.id} logged in with password ${password}")

// ✅ Good
logger.infoWith("User logged in", "userId" to user.id)
```

---

## Examples by Use Case

### Controller

```kotlin
@RestController
@RequestMapping("/api/projects")
class ProjectController(
    private val projectService: ProjectService
) {
    private val logger = logger()

    @PostMapping
    fun createProject(@RequestBody request: CreateProjectRequest): ProjectDTO {
        logger.infoWith(
            "Create project request",
            "name" to request.name
        )

        return try {
            projectService.createProject(request)
        } catch (e: Exception) {
            logger.errorWith(
                "Failed to create project",
                e,
                "name" to request.name
            )
            throw e
        }
    }
}
```

### Service with Timing

```kotlin
@Service
class ProjectService {
    private val logger = logger()

    fun getProjects(page: Int, size: Int): Page<ProjectDTO> {
        return logger.measureTime("Fetch projects", LogLevel.DEBUG) {
            val pageable = PageRequest.of(page, size)
            projectRepository.findAll(pageable).map { ProjectDTO.from(it) }
        }
    }
}
```

### Repository Operations

```kotlin
@Service
class EntityService {
    private val logger = logger()

    fun searchEntities(projectId: Long, filters: EntitySearchRequest): Page<EntityDTO> {
        logger.debugWith(
            "Searching entities",
            "projectId" to projectId,
            "type" to filters.type,
            "tags" to filters.tags,
            "search" to filters.search
        )

        val result = logger.measureTime("Entity search") {
            // Complex search logic
            entityRepository.search(filters)
        }

        logger.infoWith(
            "Search completed",
            "projectId" to projectId,
            "resultCount" to result.totalElements
        )

        return result
    }
}
```

---

## Troubleshooting

### Logs not appearing

Check log levels in `application.yml`:

```yaml
logging:
  level:
    io.mytherion: DEBUG
```

### Request ID not showing

Ensure `RequestLoggingFilter` is registered as a Spring component (it should be auto-detected with `@Component`).

### MDC context not persisting

MDC is thread-local. When using async operations, you may need to propagate MDC context manually.

---

## Summary

✅ **Kotlin extensions** for cleaner logging code  
✅ **Structured logging** with context  
✅ **Request correlation** via MDC  
✅ **Execution timing** for performance monitoring  
✅ **Function tracing** for debugging  
✅ **Colored console** output for development  
✅ **Production-ready** with proper log levels
