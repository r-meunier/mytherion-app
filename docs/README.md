# Mytherion – Project Plans & Documentation

This directory contains all architectural plans, implementation strategies, and technical decisions made during development.

## Plans Index

| File | Description | Status |
| :--- | :--- | :--- |
| [terminology.md](./terminology.md) | **Canonical vocabulary.** One concept, one code name; banned words and the rename map | 📌 Source of Truth |
| [product-vision-and-roadmap.md](./product-vision-and-roadmap.md) | Product vision: Codex, context-scoped AI writing, author-owned data; roadmap & planned features | 📌 Active Reference |
| [codex-entry-model.md](./codex-entry-model.md) | Entry details, aliases and Blank/Basic/Full templates replacing the hardcoded SectionTypes (MYT-85) | 📌 Agreed baseline |
| [style-guide.md](./style-guide.md) | **How project pages are built:** page frame, header and breadcrumbs, surfaces, type, controls. The entry page is the reference | 📌 Source of Truth |
| [decisions/0001-local-first-desktop-client.md](./decisions/0001-local-first-desktop-client.md) | Desktop client: Tauri, no JVM, project as a folder of files, UI shared through the service seam | ✅ Accepted (file format draft) |
| [navigation-overhaul-plan.md](./navigation-overhaul-plan.md) | Project-centric navigation: URL hierarchy, security, sidebar modes, phased rollout | 🔄 In Progress |
| [css-architecture.md](./css-architecture.md) | CSS tree: `base.css` → `auth.css` / `projects.css` / `app-core.css`, and which layout loads which | 📌 Active Reference |

## Backlog / Open TODOs

- [ ] **Environment-specific setup** – Finalize env config for dev/staging/prod profiles.
- [ ] **Logging setup** – Semi-done; full structured logging still needed.
- [ ] **Admin menu/navbar** – User management UI (admin-specific routes and views).
- [ ] **Global Search** – Cross-project search (see navigation overhaul open questions).
- [ ] **Shared Entries** – Recurring characters across projects/series.
- [ ] **Remember the last project** – Reopen the project the author last worked in (navigation overhaul, Phase 5).
