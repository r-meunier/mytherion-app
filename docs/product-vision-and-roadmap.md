# Mytherion – Product Vision, Architectural Direction & Roadmap

**Date:** September 2026  
**Status:** Approved Strategic Direction  
**Scope:** Evolution from Worldbuilding Codex to All-in-One Novelist Planning & Writing Studio

---

## 1. Executive Summary & Core Philosophy

Mytherion began as a worldbuilding platform focused on data sovereignty ("the author owns their data"). The expanded vision evolves Mytherion into an **all-in-one planning and writing studio for novelists**.

### The Core Problem in Current Tooling
1. **The "Obsidian Trap" (Configuration Fatigue):** Authors spend weeks setting up 40+ community plugins, frontmatter metadata, and brittle Dataview queries just to approximate a story bible and outliner. Instead of writing, they become system administrators for their own notes.
2. **The "SaaS Trap" (Cost & Vendor Lock-In):** Modern AI writing platforms (Novelcrafter, Sudowrite, etc.) charge steep recurring subscriptions ($20–$50+/month), mark up underlying API costs, lock user data inside proprietary clouds, and export chaotic directory trees of loose markdown and JSON files.
3. **The "Flat Document Trap" (Outdated Word Processors):** Tools like Word or basic Scrivener setups treat a 100k-word novel as flat text or arbitrary folder trees, without structured awareness of characters, locations, plot threads, or continuity.

### The Mytherion Thesis
> **Writing a novel is engineering for narrative.**  
> A novel is an interconnected project graph of characters, locations, arcs, timelines, and scenes. Mytherion treats creative work with the same structural visibility, version control, and precision that modern developer tools (e.g. Claude Code, Cursor, Git) bring to software engineering.

---

## 2. The Four Pillars of Mytherion

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              MYTHERION PROJECT                               │
├──────────────────────┬──────────────────────┬────────────────────────────────┤
│ 1. THE CODEX         │ 2. THE PLANNER       │ 3. THE MANUSCRIPT STUDIO       │
│ (World & Lore Bible) │ (Story Architecture) │ (Distraction-Free Drafting)    │
├──────────────────────┼──────────────────────┼────────────────────────────────┤
│ • Characters & Roles │ • Act & Beat Sheets  │ • Chapter & Scene Hierarchy    │
│ • Locations & Maps   │ • Plot Thread Tracks │ • Split-View Reference Drawer  │
│ • Items, Magic, Factions • Chronology vs Story│ • Scene-as-Atomic-Unit (POV,   │
│ • JSONB Metadata     │ • Character Arcs     │   goals, mood, word counts)    │
├──────────────────────┴──────────────────────┴────────────────────────────────┤
│ 4. CONTINUITY ENGINE & AI LAYER (Targeted Context, Diffs & Data Sovereignty) │
│ • Bidirectional Backlinks (`@character`, `[[location]]`)                     │
│ • "Claude Code for Fiction": Scoped context (POV voice + beat + sensory)      │
│ • Multi-Model & BYOK (Anthropic Claude, OpenAI, Google Gemini, local Ollama) │
│ • Single-file `.mytherion` project package & clean DOCX / EPUB compilation    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Strategic & Architectural Decisions

### 3.1 Phased Execution: Option A (Codex-First Foundation)
* **Decision:** We will **complete the Codex MVP to a polished, working prototype level first** before introducing Manuscript and Outliner modules.
* **Rationale:** A worldbuilding system with clean ergonomics, responsive UI, image attachments, and resilient filtering serves as an immediate, stand-alone proof-of-concept. It also establishes the core data models that the Manuscript and Planner will later reference.
* **Architecture Safeguard:** Ensure all current route designs, project scopes, and database schemas leave clear slots for `/planner` and `/manuscript` without requiring structural refactoring later.

### 3.2 Desktop Portability Strategy (Windows & macOS)
* **Goal:** Authors strongly favor local-only software free from cloud vulnerabilities and subscriptions. Mytherion must be natively portable to Windows and macOS.
* **Frontend Portability (95%+ Reusable):**
  * Built on Next.js, React, Redux Toolkit, and Tailwind CSS.
  * Can be packaged into desktop shells using **Tauri** (lightweight, Rust-backed, sub-15MB installer, low memory) or **Electron**.
* **Backend Decoupling Strategy:**
  * The frontend communicates with the backend solely through strict REST API contracts and decoupled DTOs.
  * In the web deployment, the backend runs Spring Boot + PostgreSQL + MinIO.
  * In the future desktop edition, the persistence layer can be swapped to an embedded engine (e.g. **SQLite** with native JSON functions, matching Postgres `JSONB`) with local disk file storage replacing MinIO.
  * **Rule:** Never introduce cloud-proprietary dependencies into the client application.

### 3.3 Data Sovereignty & Export Model
* **The Single-File Project Package (`.mytherion`):**
  * Instead of dumping hundreds of confusing loose `.md` and `.json` files (like Novelcrafter), full project backups will be packaged into a unified `.mytherion` archive (a structured ZIP containing SQLite/JSON data + media assets).
  * Double-clickable, portable across machines, and easy to sync via Dropbox, Google Drive, or local storage.
* **Standard Publication Compilations:**
  * **DOCX:** Standard manuscript format (1-inch margins, proper font sizing, header/page numbers, chapter breaks) for submission to agents and editors.
  * **EPUB:** Clean, validated reflowable format for e-readers.
  * **Single-File Markdown/PDF:** Clean, readable versions for personal reading or proofing.
* **Version History:** Draft snapshots and milestone "commits" (e.g. "Draft 1 Complete", "Post-Editor Revisions") with visual diff comparisons.

### 3.4 The AI Layer: "Claude Code for Novelists"
* **The Problem with Chat Wrappers:** Dumping entire character sheets or novel outlines into LLMs causes hallucinations, voice drift, and massive token waste.
* **Targeted Context Scoping:**
  * When writing or revising a scene, the AI engine dynamically queries only the relevant slice of the project graph:
    1. **POV Voice & Nuance:** The active character's primary traits, voice quirks, and immediate psychological drive (not their 10-page backstory).
    2. **Setting Texture:** Sensory details and atmosphere of the current scene's location.
    3. **The Immediate Beat:** The scene's specific conflict, objective, and emotional turning point.
    4. **Immediate Prose Window:** The preceding ~500 words for rhythm and tone consistency.
* **Targeted Diffs over Full Overwrites:** AI suggestions are delivered as inline diffs or paragraph-level proposals, leaving full control with the author.
* **BYOK (Bring Your Own Key) & Multi-Model:**
  * No forced markup or monthly AI subscriptions.
  * Authors provide their own API keys for Claude, OpenAI, or Gemini.
  * Full support for local offline inference (e.g., **Ollama** running Llama or Mistral locally) for authors with strict zero-cloud privacy requirements.

---

## 4. Route & Navigation Architecture

Aligned with the [Navigation Overhaul Plan](./navigation-overhaul-plan.md), the URL hierarchy cleanly separates global hub activities from project-specific workflows:

```text
/projects                      -> Global Project Hub (All worlds/novels)
/projects/new                  -> Create a new world/novel project

/projects/[id]                 -> Project Dashboard (Overview, word counts, quick actions)
/projects/[id]/codex           -> The Codex (Entities: Characters, Locations, Items, etc.)
/projects/[id]/codex/[entityId]-> Single Entity Inspector & Editor
/projects/[id]/planner         -> [Phase 2] Outliner, Beat Sheets, Arcs & Timelines
/projects/[id]/manuscript      -> [Phase 2] Chapter & Scene Writing Studio
/projects/[id]/settings        -> Project Settings, Export/Import, API Key Management
```

---

## 5. Immediate Action Plan (Codex MVP Polish)

To bring the Codex MVP to prototype completion before launching the Manuscript/Planner phase:

1. **Project Navigation Scoping:**
   * Finalize the dual-mode sidebar (Global vs. Project mode).
   * Ensure entity routes are strictly scoped under `/projects/[id]/codex`.
2. **Backend Query & Filter Enhancements:**
   * Implement full entity filtering by type, tags, and text search in `EntityService.kt`.
   * Enforce tenant isolation / project ownership at the API boundary.
3. **Media Integration:**
   * Connect MinIO image upload directly to `EntityForm` and render portraits in `EntityCard` and entity detail pages.
4. **UI & Ergonomic Polish:**
   * Streamline entity creation and editing to reduce form friction.
   * Finalize design system typography and dark-mode aesthetic.
