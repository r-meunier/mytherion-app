# Quick Start: API Performance Monitoring

## 🚀 Get Started in 30 Minutes

This guide gets you from zero to basic performance metrics in under 30 minutes.

---

## Step 1: Add Dependencies (5 minutes)

Add to `build.gradle.kts`:

```kotlin
dependencies {
    // ... existing dependencies

    // Performance monitoring
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("io.micrometer:micrometer-registry-prometheus")
}
```

Run:

```bash
./gradlew build
```

---

## Step 2: Configure Actuator (5 minutes)

Add to `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
      base-path: /actuator
  endpoint:
    health:
      show-details: always
  metrics:
    tags:
      application: mytherion-backend
    distribution:
      percentiles-histogram:
        http.server.requests: true
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
```

---

## Step 3: Restart and Test (5 minutes)

```bash
# Restart your application
docker-compose restart

# Test endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/metrics/http.server.requests
```

---

## Step 4: View Your Metrics (5 minutes)

### Available Metrics

```bash
# HTTP Request metrics
curl http://localhost:8080/actuator/metrics/http.server.requests | jq

# JVM Memory
curl http://localhost:8080/actuator/metrics/jvm.memory.used | jq

# Database connections
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active | jq
```

### Example Output

```json
{
  "name": "http.server.requests",
  "measurements": [
    {
      "statistic": "COUNT",
      "value": 156.0
    },
    {
      "statistic": "TOTAL_TIME",
      "value": 12.5
    },
    {
      "statistic": "MAX",
      "value": 0.523
    }
  ],
  "availableTags": [
    {
      "tag": "uri",
      "values": ["/api/projects", "/api/projects/{id}", "/api/auth/login"]
    },
    {
      "tag": "status",
      "values": ["200", "201", "404", "500"]
    }
  ]
}
```

---

## Step 5: Query Specific Endpoints (10 minutes)

### Get metrics for a specific endpoint

```bash
# Projects endpoint performance
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/api/projects" | jq

# Stats endpoint performance (the one we optimized!)
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/api/projects/{id}/stats" | jq

# Filter by status code
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=status:200" | jq
```

### Prometheus format (for tools)

```bash
curl http://localhost:8080/actuator/prometheus
```

---

## What You Get Immediately

✅ **HTTP Metrics**

- Request count per endpoint
- Average response time
- Max response time
- Status code distribution

✅ **JVM Metrics**

- Heap memory usage
- GC pause time
- Thread count

✅ **Database Metrics**

- Active connections
- Idle connections
- Connection wait time

---

## Next Steps

### Option A: Simple Monitoring Script

Create `scripts/check-performance.sh`:

```bash
#!/bin/bash

echo "=== API Performance Report ==="
echo ""

echo "Top 5 Slowest Endpoints:"
curl -s http://localhost:8080/actuator/prometheus | \
  grep 'http_server_requests_seconds_sum' | \
  sort -t'{' -k2 -r | \
  head -5

echo ""
echo "Memory Usage:"
curl -s http://localhost:8080/actuator/metrics/jvm.memory.used | \
  jq '.measurements[] | select(.statistic=="VALUE") | .value'

echo ""
echo "Active DB Connections:"
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.active | \
  jq '.measurements[] | select(.statistic=="VALUE") | .value'
```

### Option B: Set Up Grafana (Recommended)

See [PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md#tier-3-full-observability-stack-production-ready) for full setup.

---

## Verify Performance Improvements

### Before/After Comparison

Test the optimized stats endpoint:

```bash
# Make a request
time curl http://localhost:8080/api/projects/1/stats

# Check metrics
curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=uri:/api/projects/{id}/stats" | \
  jq '.measurements[] | select(.statistic=="TOTAL_TIME")'
```

You should see:

- **Before optimization**: 1000-5000ms for projects with many entries
- **After optimization**: < 200ms regardless of entry count

---

## Common Queries

### Find slowest endpoints

```bash
curl -s http://localhost:8080/actuator/prometheus | \
  grep 'http_server_requests_seconds_max' | \
  sort -t'=' -k2 -rn | \
  head -10
```

### Check error rate

```bash
curl -s "http://localhost:8080/actuator/metrics/http.server.requests?tag=status:500" | \
  jq '.measurements[] | select(.statistic=="COUNT") | .value'
```

### Monitor memory growth

```bash
watch -n 5 'curl -s http://localhost:8080/actuator/metrics/jvm.memory.used | jq ".measurements[] | select(.statistic==\"VALUE\") | .value"'
```

---

## Troubleshooting

### Metrics not showing up?

1. Check Actuator is enabled:

   ```bash
   curl http://localhost:8080/actuator
   ```

2. Verify configuration in `application.yml`

3. Check logs for errors:
   ```bash
   docker-compose logs backend | grep -i actuator
   ```

### Endpoints returning 404?

Ensure `management.endpoints.web.exposure.include` includes the endpoint name.

---

## Success Checklist

- [ ] Dependencies added and built successfully
- [ ] `/actuator/health` returns 200 OK
- [ ] `/actuator/metrics` shows available metrics
- [ ] HTTP request metrics visible
- [ ] Can query specific endpoint performance
- [ ] Prometheus endpoint accessible

---

## Time Investment

- **Setup**: 30 minutes (one-time)
- **Daily monitoring**: 5 minutes
- **Performance investigation**: 15-30 minutes when needed

**ROI**: Immediate visibility into performance issues that previously required manual log analysis.

---

## What's Next?

1. ✅ **Week 1**: Use metrics to identify slow endpoints
2. ✅ **Week 2**: Set up Grafana for visual dashboards
3. ✅ **Week 3**: Configure alerts for performance degradation
4. ✅ **Week 4**: Establish performance SLOs (Service Level Objectives)

See [PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md) for the complete strategy.
