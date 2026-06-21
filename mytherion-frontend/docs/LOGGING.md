# Logging Guide

## Overview

The Mytherion frontend uses a structured logging system that provides:

- **Multiple log levels** (DEBUG, INFO, WARN, ERROR)
- **Environment-aware behavior** (pretty console in dev, JSON in production)
- **Contextual logging** with child loggers
- **Colored output** for easy visual scanning

---

## Basic Usage

### Import the logger

```typescript
import { log } from "@/app/utils/logger";
// or
import logger from "@/app/utils/logger";
```

### Log levels

```typescript
// Debug - development only, detailed information
log.debug("User clicked button", { buttonId: "submit", userId: 123 });

// Info - general informational messages
log.info("User logged in successfully", { username: "john_doe" });

// Warn - warning messages for potential issues
log.warn("API response slow", {
  responseTime: 3500,
  endpoint: "/api/projects",
});

// Error - error messages with optional Error object
try {
  // some code
} catch (error) {
  log.error("Failed to create project", error, { projectName: "My Project" });
}
```

---

## Advanced Usage

### Child Loggers

Create a child logger with default context for a specific module:

```typescript
import logger from "@/app/utils/logger";

// In a service file
const serviceLogger = logger.child({ service: "projectService" });

export const projectService = {
  getProjects: async () => {
    serviceLogger.info("Fetching projects");
    try {
      const response = await axios.get("/api/projects");
      serviceLogger.debug("Projects fetched", { count: response.data.length });
      return response.data;
    } catch (error) {
      serviceLogger.error("Failed to fetch projects", error);
      throw error;
    }
  },
};
```

### Component Logging

```typescript
import { log } from '@/app/utils/logger';

export default function MyComponent() {
  useEffect(() => {
    log.debug('Component mounted', { component: 'MyComponent' });

    return () => {
      log.debug('Component unmounted', { component: 'MyComponent' });
    };
  }, []);

  const handleClick = () => {
    log.info('Button clicked', { action: 'submit', component: 'MyComponent' });
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### Redux Logging

```typescript
import { log } from "@/app/utils/logger";

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async ({ page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      log.info("Fetching projects", { page, size });
      const response = await projectService.getProjects(page, size);
      log.debug("Projects fetched successfully", {
        count: response.content.length,
      });
      return response;
    } catch (error) {
      log.error("Failed to fetch projects", error, { page, size });
      return rejectWithValue(error);
    }
  },
);
```

---

## Log Levels

### DEBUG (Gray)

- **When to use:** Detailed diagnostic information
- **Visibility:** Development only
- **Examples:**
  - Component lifecycle events
  - State changes
  - API request/response details
  - User interactions

### INFO (Blue)

- **When to use:** General informational messages
- **Visibility:** Development and production
- **Examples:**
  - User actions (login, logout, navigation)
  - Successful operations
  - Application state changes

### WARN (Yellow)

- **When to use:** Warning messages for potential issues
- **Visibility:** Development and production
- **Examples:**
  - Slow API responses
  - Deprecated feature usage
  - Validation warnings
  - Fallback behavior

### ERROR (Red)

- **When to use:** Error conditions
- **Visibility:** Development and production
- **Examples:**
  - API failures
  - Unhandled exceptions
  - Validation errors
  - Network errors

---

## Output Format

### Development (Pretty Console)

```
[2026-01-19T19:46:00.000Z] [INFO] User logged in successfully { username: 'john_doe' }
[2026-01-19T19:46:01.000Z] [DEBUG] Fetching projects { page: 0, size: 20 }
[2026-01-19T19:46:02.000Z] [ERROR] Failed to create project { error: { name: 'AxiosError', message: 'Network Error' } }
```

### Production (JSON)

```json
{"timestamp":"2026-01-19T19:46:00.000Z","level":"INFO","message":"User logged in successfully","username":"john_doe"}
{"timestamp":"2026-01-19T19:46:01.000Z","level":"DEBUG","message":"Fetching projects","page":0,"size":20}
{"timestamp":"2026-01-19T19:46:02.000Z","level":"ERROR","message":"Failed to create project","error":{"name":"AxiosError","message":"Network Error"}}
```

---

## Best Practices

### ✅ Do

- Use appropriate log levels
- Include relevant context
- Log user actions and API calls
- Log errors with full context
- Use child loggers for modules

### ❌ Don't

- Log sensitive information (passwords, tokens)
- Log excessively in tight loops
- Use console.log directly (use logger instead)
- Log PII without sanitization
- Forget to include context

---

## Examples by Use Case

### API Service

```typescript
import logger from "@/app/utils/logger";

const apiLogger = logger.child({ module: "api" });

export const api = {
  request: async (url: string, options: RequestInit) => {
    apiLogger.debug("API request", { url, method: options.method });

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        apiLogger.warn("API response not OK", {
          url,
          status: response.status,
          statusText: response.statusText,
        });
      }

      apiLogger.debug("API response", { url, status: response.status });
      return response;
    } catch (error) {
      apiLogger.error("API request failed", error, { url });
      throw error;
    }
  },
};
```

### Form Submission

```typescript
const handleSubmit = async (data: FormData) => {
  log.info("Form submission started", { form: "createProject" });

  try {
    const result = await dispatch(createProject(data));
    log.info("Form submitted successfully", {
      form: "createProject",
      projectId: result.id,
    });
    router.push(`/projects/${result.id}`);
  } catch (error) {
    log.error("Form submission failed", error, { form: "createProject", data });
  }
};
```

### Authentication

```typescript
const handleLogin = async (credentials: LoginCredentials) => {
  log.info("Login attempt", { username: credentials.username });

  try {
    await dispatch(loginUser(credentials));
    log.info("Login successful", { username: credentials.username });
  } catch (error) {
    log.error("Login failed", error, { username: credentials.username });
  }
};
```

---

## Configuration

The logger automatically configures based on `NODE_ENV`:

- **Development:** DEBUG level and above, colored console output
- **Production:** INFO level and above, JSON output

To change the minimum log level, modify the `Logger` constructor in `app/utils/logger.ts`.
