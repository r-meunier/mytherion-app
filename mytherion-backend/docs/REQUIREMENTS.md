# Mytherion — Production Readiness Requirements

A living checklist of what needs to be in place before Mytherion is deployed and published publicly.

---

## 1. Functional Completeness

The core user loop must work end-to-end without gaps or happy-path-only behaviour.

- [ ] Create a world / project
- [ ] Define custom entry types
- [ ] Populate entries with metadata
- [ ] AI assistance navigating and expanding the Codex
- [ ] All flows handle edge cases and errors gracefully, not just the happy path

---

## 2. Auth & Security

- [ ] Password reset flow
- [ ] Email verification on signup
- [ ] Rate limiting on auth endpoints
- [ ] Input validation and sanitization throughout the API
- [ ] HTTPS enforced (no plain HTTP in production)
- [ ] No stack traces or internal errors exposed to the client
- [ ] Review JWT expiry and refresh token strategy

---

## 3. Infrastructure

- [ ] Production hosting chosen and configured (VPS or managed platform — e.g. Hetzner, Railway, Fly.io)
- [ ] Reverse proxy set up (Nginx or Caddy)
- [ ] TLS certificate provisioned and auto-renewing (e.g. Let's Encrypt via Caddy)
- [ ] Domain name registered and DNS configured
- [ ] Docker Compose replaced or supplemented with a production-grade deployment config
- [ ] MinIO instance properly secured and persisted
- [ ] Mailhog replaced with a real email provider (e.g. Resend, Postmark, SES)

---

## 4. Database

- [ ] PostgreSQL running on a managed service or with a proper backup strategy
- [ ] Database migrations managed with Flyway or Liquibase (not `ddl-auto=create`)
- [ ] Automated backups scheduled and tested
- [ ] Connection pooling configured (e.g. HikariCP settings reviewed for production load)

---

## 5. Reliability & Observability

- [ ] Structured logging in place (backend)
- [ ] Error monitoring configured (e.g. Sentry)
- [ ] Uptime monitoring (e.g. Uptime Robot, Better Stack)
- [ ] Health check endpoint (`/actuator/health` or equivalent)
- [ ] Frontend error boundary handling

---

## 6. AI Integration

- [ ] AI Codex navigation working end-to-end
- [ ] API key management (never exposed to the client)
- [ ] Rate limiting and cost controls on AI calls
- [ ] Graceful degradation if AI service is unavailable

---

## 7. Testing

- [ ] Core backend endpoints covered by integration tests
- [ ] Critical frontend flows covered by E2E tests
- [ ] CI pipeline runs tests on every push
- [ ] Smoke test suite that can run against the live deployment

---

## 8. Polish & UX

- [ ] Responsive on mobile
- [ ] Loading and error states on all async operations
- [ ] Empty states for new users (onboarding flow or guidance)
- [ ] Consistent error messaging visible to users

---

## Priority Order

1. Core features working end-to-end
2. Security hardened
3. Deployment infrastructure
4. Database production-readiness
5. Monitoring and reliability
6. AI integration complete
7. Test coverage
8. UX polish

---

*Last updated: May 2026*
