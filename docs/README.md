# Mytherion – Project Plans & Documentation

This directory contains all architectural plans, implementation strategies, and technical decisions made during development.

## Plans Index

| File | Description | Status |
| :--- | :--- | :--- |
| [terminology.md](./terminology.md) | **Canonical vocabulary.** One concept, one code name; banned words and the rename map | 📌 Source of Truth |
| [product-vision-and-roadmap.md](./product-vision-and-roadmap.md) | Product vision, architectural direction, desktop portability & all-in-one novelist studio roadmap | 📌 Active Reference |
| [navigation-overhaul-plan.md](./navigation-overhaul-plan.md) | Project-centric navigation: URL hierarchy, security, sidebar modes, phased rollout | 🔄 In Progress |
| [component-architecture-plan.md](./component-architecture-plan.md) | Entry section coupling: shared type registry, workflow for adding new sections, meta-driven UI | ✅ Mostly Done |
| [css-architecture-plan.md](./css-architecture-plan.md) | CSS tree: `base.css` → `auth.css` / `projects.css` / `app-core.css` modular structure | 🔄 In Progress |
| [design-system-plan.md](./design-system-plan.md) | Centralized semantic typography utilities (`text-sidebar-nav-header`, etc.) | ✅ Done |
| [ci-environment-fix-plan.md](./ci-environment-fix-plan.md) | CI pipeline fixes (Flyway timing, Gradle wrapper, Jest/ts-node, local Spring Boot issues) | ✅ Resolved |

## Backlog / Open TODOs

- [ ] **Environment-specific setup** – Finalize env config for dev/staging/prod profiles.
- [ ] **Logging setup** – Semi-done; full structured logging still needed.
- [ ] **Admin menu/navbar** – User management UI (admin-specific routes and views).
- [ ] **Global Search** – Cross-project search (see navigation overhaul open questions).
- [ ] **Shared Entries** – Recurring characters across projects/series.
- [ ] **Meta-Data Driven UI** – `/api/entries/sections/schema` endpoint for dynamic form generation.
