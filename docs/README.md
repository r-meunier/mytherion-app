# Mytherion – Project Plans & Documentation

This directory contains all architectural plans, implementation strategies, and technical decisions made during development.

## Plans Index

| File | Description | Status |
| :--- | :--- | :--- |
| [product-vision-and-roadmap.md](./product-vision-and-roadmap.md) | Product vision, architectural direction, desktop portability & all-in-one novelist studio roadmap | 📌 Active Reference |
| [navigation-overhaul-plan.md](./navigation-overhaul-plan.md) | Project-centric navigation: URL hierarchy, security, sidebar modes, phased rollout | 🔄 In Progress |
| [component-architecture-plan.md](./component-architecture-plan.md) | Entity component coupling: shared type registry, workflow for adding new components, meta-driven UI | ✅ Mostly Done |
| [css-architecture-plan.md](./css-architecture-plan.md) | CSS tree: `base.css` → `auth.css` / `projects.css` / `app-core.css` modular structure | 🔄 In Progress |
| [design-system-plan.md](./design-system-plan.md) | Centralized semantic typography utilities (`text-sidebar-nav-header`, etc.) | ✅ Done |
| [ci-environment-fix-plan.md](./ci-environment-fix-plan.md) | CI pipeline fixes (Flyway timing, Gradle wrapper, Jest/ts-node, local Spring Boot issues) | ✅ Resolved |

## Backlog / Open TODOs

- [ ] **Environment-specific setup** – Finalize env config for dev/staging/prod profiles.
- [ ] **Logging setup** – Semi-done; full structured logging still needed.
- [ ] **Admin menu/navbar** – User management UI (admin-specific routes and views).
- [ ] **Global Search** – Cross-project search (see navigation overhaul open questions).
- [ ] **Shared Entities** – Recurring characters across projects/series.
- [ ] **Meta-Data Driven UI** – `/api/entities/components/schema` endpoint for dynamic form generation.
