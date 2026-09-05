# API Performance Measurement Strategy

## Executive Summary

This document outlines a pragmatic, multi-layered approach to measuring and monitoring API performance in the Mytherion backend. The strategy leverages existing infrastructure (structured logging with `measureTime`) and introduces complementary tools for comprehensive performance visibility.

---

## Current State Assessment

### ✅ Existing Capabilities

1. **Structured Logging** - Already implemented via `LoggingExtensions.kt`
2. **Execution Timing** - `logger.measureTime()` for critical operations
3. **Request Correlation** - MDC with request IDs
4. **Database Query Logging** - Hibernate SQL logging enabled

### 🎯 Gaps to Address

1. **Aggregated Metrics** - No centralized performance metrics collection
2. **Historical Trends** - No time-series data for performance analysis
3. **Percentile Analysis** - Cannot identify p50, p95, p99 response times
4. **Automated Alerting** - No proactive performance degradation detection
5. **Visual Dashboards** - No real-time performance visibility

---

## Recommended Strategy: Three-Tier Approach

### Tier 1: Enhanced Logging (Immediate - 1-2 days)

**Goal**: Better structured performance data in logs  
**Effort**: Low | **Value**: Medium | **Cost**: Free

### Tier 2: Spring Boot Actuator + Micrometer (Short-term - 3-5 days)

**Goal**: Production-grade metrics collection and exposure  
**Effort**: Medium | **Value**: High | **Cost**: Free

### Tier 3: Observability Stack (Long-term - 1-2 weeks)

**Goal**: Complete observability with dashboards and alerting  
**Effort**: High | **Value**: Very High | **Cost**: Low (self-hosted)

---

## Tier 1: Enhanced Logging (Start Here)

### Implementation

#### 1.1 Create Performance Logging Interceptor

```kotlin
// src/main/kotlin/io/mytherion/platform/monitoring/PerformanceInterceptor.kt
package io.mytherion.platform.monitoring

import io.mytherion.platform.logging.logger
import io.mytherion.platform.logging.infoWith
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.ModelAndView

@Component
class PerformanceInterceptor : HandlerInterceptor {
    private val logger = logger()

    companion object {
        private const val START_TIME_ATTRIBUTE = "startTime"
    }

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis())
        return true
    }

    override fun postHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        modelAndView: ModelAndView?
    ) {
        val startTime = request.getAttribute(START_TIME_ATTRIBUTE) as? Long ?: return
        val duration = System.currentTimeMillis() - startTime

        logger.infoWith(
            "API Request Completed",
            "method" to request.method,
            "path" to request.requestURI,
            "status" to response.status,
            "duration_ms" to duration,
            "query_params" to request.queryString
        )

        // Warn on slow requests (> 1 second)
        if (duration > 1000) {
            logger.warnWith(
                "Slow API Request Detected",
                "method" to request.method,
                "path" to request.requestURI,
                "duration_ms" to duration
            )
        }
    }
}
```

#### 1.2 Register Interceptor

```kotlin
// src/main/kotlin/io/mytherion/config/WebMvcConfig.kt
package io.mytherion.config

import io.mytherion.platform.monitoring.PerformanceInterceptor
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebMvcConfig(
    private val performanceInterceptor: PerformanceInterceptor
) : WebMvcConfigurer {

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(performanceInterceptor)
            .addPathPatterns("/api/**")
    }
}
```

#### 1.3 Enhanced Service-Level Timing

Update existing services to include more granular timing:

```kotlin
@Service
class ProjectService {
    private val logger = logger()

    fun getProjectStats(id: Long): ProjectStatsDTO {
        val user = getCurrentUser()

        val project = logger.measureTime("Fetch project by ID") {
            projectRepository.findById(id).orElseThrow { ProjectNotFoundException(id) }
        }

        verifyOwnership(project, user)

        return logger.measureTime("Calculate project stats") {
            val entityCount = logger.measureTime("Count entities") {
                entityRepository.countByProjectAndDeletedAtIsNull(project).toInt()
            }

            val entityCountByType = logger.measureTime("Count by type") {
                entityRepository.countByProjectAndTypeGrouped(project)
                    .associate { it.getType().name to it.getCount().toInt() }
            }

            ProjectStatsDTO.from(project, entityCount, entityCountByType)
        }
    }
}
```

### Benefits

- ✅ Zero additional dependencies
- ✅ Works with existing logging infrastructure
- ✅ Immediate visibility into slow endpoints
- ✅ Structured data for log aggregation tools

### Limitations

- ❌ No aggregation or percentiles
- ❌ Manual log analysis required
- ❌ No historical trending

---

## Tier 2: Spring Boot Actuator + Micrometer (Recommended)

### Why This Approach?

- **Industry Standard**: Used by thousands of production Spring Boot applications
- **Zero Code Changes**: Metrics collection via annotations and auto-configuration
- **Flexible Backends**: Export to Prometheus, Grafana, CloudWatch, Datadog, etc.
- **Rich Metrics**: Automatic JVM, HTTP, database, and custom metrics

### Implementation

#### 2.1 Add Dependencies

```kotlin
// build.gradle.kts
dependencies {
    // Actuator for metrics endpoints
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Micrometer for metrics collection
    implementation("io.micrometer:micrometer-registry-prometheus")

    // Optional: Micrometer tracing for distributed tracing
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
}
```

#### 2.2 Configure Actuator

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: when-authorized
    metrics:
      enabled: true
  metrics:
    tags:
      application: mytherion-backend
      environment: ${ENVIRONMENT:development}
    distribution:
      percentiles-histogram:
        http.server.requests: true
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
      slo:
        http.server.requests: 100ms,200ms,500ms,1s,2s
```

#### 2.3 Custom Metrics for Business Operations

```kotlin
// src/main/kotlin/io/mytherion/platform/monitoring/MetricsService.kt
package io.mytherion.platform.monitoring

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Timer
import org.springframework.stereotype.Service

@Service
class MetricsService(private val meterRegistry: MeterRegistry) {

    fun recordProjectCreation(durationMs: Long, success: Boolean) {
        Timer.builder("project.creation")
            .tag("success", success.toString())
            .description("Time to create a project")
            .register(meterRegistry)
            .record(durationMs, java.util.concurrent.TimeUnit.MILLISECONDS)
    }

    fun recordEntityQuery(projectId: Long, entityCount: Int, durationMs: Long) {
        meterRegistry.counter("entity.queries.total",
            "project_id", projectId.toString()
        ).increment()

        meterRegistry.gauge("entity.query.size", entityCount.toDouble())

        Timer.builder("entity.query.duration")
            .tag("size_bucket", getSizeBucket(entityCount))
            .register(meterRegistry)
            .record(durationMs, java.util.concurrent.TimeUnit.MILLISECONDS)
    }

    private fun getSizeBucket(count: Int): String = when {
        count < 10 -> "small"
        count < 100 -> "medium"
        count < 1000 -> "large"
        else -> "xlarge"
    }
}
```

#### 2.4 Use Metrics in Services

```kotlin
@Service
class ProjectService(
    private val metricsService: MetricsService
) {
    fun createProject(request: CreateProjectRequest): ProjectResponse {
        val startTime = System.currentTimeMillis()
        var success = false

        return try {
            val result = // ... create project logic
            success = true
            result
        } finally {
            val duration = System.currentTimeMillis() - startTime
            metricsService.recordProjectCreation(duration, success)
        }
    }
}
```

### Available Metrics (Out of the Box)

#### HTTP Metrics

- `http.server.requests` - Request count, duration, status codes
- `http.server.requests.percentile` - p50, p95, p99 latencies
- `http.server.requests.histogram` - Response time distribution

#### JVM Metrics

- `jvm.memory.used` - Heap and non-heap memory
- `jvm.gc.pause` - Garbage collection pauses
- `jvm.threads.live` - Active thread count

#### Database Metrics

- `hikaricp.connections.active` - Active DB connections
- `hikaricp.connections.pending` - Waiting connections
- `hikaricp.connections.timeout` - Connection timeouts

### Accessing Metrics

```bash
# Health check
curl http://localhost:8080/actuator/health

# All available metrics
curl http://localhost:8080/actuator/metrics

# Specific metric
curl http://localhost:8080/actuator/metrics/http.server.requests

# Prometheus format (for scraping)
curl http://localhost:8080/actuator/prometheus
```

### Benefits

- ✅ Industry-standard metrics format
- ✅ Automatic HTTP request metrics
- ✅ Percentile calculations (p50, p95, p99)
- ✅ Ready for Prometheus/Grafana integration
- ✅ Minimal code changes required

### Limitations

- ❌ Requires external tools for visualization
- ❌ No built-in alerting

---

## Tier 3: Full Observability Stack (Production-Ready)

### Architecture

```
┌─────────────────┐
│  Mytherion API  │
│   (Spring Boot) │
└────────┬────────┘
         │ /actuator/prometheus
         ▼
┌─────────────────┐
│   Prometheus    │ ◄── Scrapes metrics every 15s
│  (Time-series)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Grafana     │ ◄── Visualizes metrics
│   (Dashboards)  │
└─────────────────┘
```

### Implementation

#### 3.1 Docker Compose Setup

```yaml
# docker-compose.monitoring.yml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - monitoring
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
    driver: bridge
```

#### 3.2 Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "mytherion-backend"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["host.docker.internal:8080"]
        labels:
          application: "mytherion-backend"
          environment: "development"
```

#### 3.3 Grafana Dashboard (JSON)

Pre-built dashboard for Spring Boot applications:

- Import Dashboard ID: `4701` (JVM Micrometer)
- Import Dashboard ID: `12900` (Spring Boot Statistics)

### Key Dashboards to Create

1. **API Performance Dashboard**
   - Request rate (req/sec)
   - Average response time
   - p95, p99 latencies
   - Error rate (4xx, 5xx)
   - Slowest endpoints

2. **Database Performance Dashboard**
   - Connection pool utilization
   - Query execution time
   - Slow query count
   - Transaction rate

3. **JVM Health Dashboard**
   - Heap memory usage
   - GC pause time
   - Thread count
   - CPU usage

### Alerting Rules

```yaml
# monitoring/alerts.yml
groups:
  - name: api_performance
    interval: 30s
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_server_requests_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time (p95 > 1s)"

      - alert: HighErrorRate
        expr: rate(http_server_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (> 5%)"

      - alert: DatabaseConnectionPoolExhausted
        expr: hikaricp_connections_pending > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
```

### Running the Monitoring Stack (Docker)

From the `mytherion-backend` directory:

```bash
cd mytherion-backend

# Start Prometheus + Grafana
docker compose -f docker-compose.monitoring.yml up -d

# Stop the monitoring stack
docker compose -f docker-compose.monitoring.yml down
```

Once running:

- Prometheus UI: `http://localhost:9090`
- Grafana UI: `http://localhost:3000` (username `admin`, password `admin` by default)

Prometheus scrapes the backend at `http://host.docker.internal:8080/actuator/prometheus`, so make sure the Mytherion backend is running on port 8080 before starting the monitoring stack.

### Benefits

- ✅ Real-time dashboards
- ✅ Historical trend analysis
- ✅ Automated alerting
- ✅ Percentile analysis (p50, p95, p99)
- ✅ Production-ready monitoring

---

## Comparison Matrix

| Feature                    | Tier 1 (Logging) | Tier 2 (Actuator) | Tier 3 (Full Stack) |
| -------------------------- | ---------------- | ----------------- | ------------------- |
| **Setup Time**             | 1-2 days         | 3-5 days          | 1-2 weeks           |
| **Cost**                   | Free             | Free              | Free (self-hosted)  |
| **Real-time Metrics**      | ❌               | ✅                | ✅                  |
| **Historical Data**        | ❌               | ⚠️ (limited)      | ✅                  |
| **Percentiles (p95, p99)** | ❌               | ✅                | ✅                  |
| **Dashboards**             | ❌               | ❌                | ✅                  |
| **Alerting**               | ❌               | ❌                | ✅                  |
| **Code Changes**           | Medium           | Low               | Low                 |
| **Operational Overhead**   | Low              | Low               | Medium              |

---

## Recommended Implementation Plan

### Phase 1: Foundation (Week 1)

1. ✅ Implement Tier 1 (Performance Interceptor)
2. ✅ Add Actuator + Micrometer dependencies
3. ✅ Configure basic metrics exposure
4. ✅ Test `/actuator/prometheus` endpoint

### Phase 2: Metrics Collection (Week 2)

1. ✅ Add custom business metrics
2. ✅ Instrument critical services
3. ✅ Set up local Prometheus + Grafana
4. ✅ Create initial dashboards

### Phase 3: Production Readiness (Week 3-4)

1. ✅ Configure alerting rules
2. ✅ Set up production monitoring stack
3. ✅ Create runbooks for common alerts
4. ✅ Train team on dashboard usage

---

## Quick Win: Start Today

**Immediate Action** (30 minutes):

1. Add Actuator dependency
2. Enable `/actuator/metrics` endpoint
3. Check current metrics: `curl http://localhost:8080/actuator/metrics`

This gives you instant visibility into:

- HTTP request metrics
- JVM memory usage
- Database connection pool stats

---

## Success Metrics

After implementation, you should be able to answer:

1. ✅ What is the p95 response time for `/api/projects/{id}`?
2. ✅ Which endpoints are slowest on average?
3. ✅ How many database connections are active right now?
4. ✅ What percentage of requests fail with 5xx errors?
5. ✅ How long does the average project creation take?
6. ✅ Are there any memory leaks or GC issues?

---

## Additional Resources

- [Spring Boot Actuator Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Micrometer Documentation](https://micrometer.io/docs)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)

---

## Next Steps

1. **Review this plan** with the team
2. **Choose starting tier** based on immediate needs
3. **Allocate time** for implementation
4. **Set success criteria** for performance targets

**Recommendation**: Start with Tier 2 (Actuator + Micrometer) as it provides the best value-to-effort ratio and sets you up for Tier 3 when needed.
