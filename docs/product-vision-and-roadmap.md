# Mytherion – Product Vision & Roadmap

**Revised:** October 2026 (replaces the September 2026 "all-in-one novelist studio" version)
**Status:** Active Reference

---

## 1. What Mytherion Is

Mytherion is an **AI-assisted writing platform for long-form fiction**, built on a Codex the
author controls, where the AI only ever sees **the minimum context a scene needs**, and where
**the author owns their data**.

Three things define it. Everything else is in service of them or belongs in
[Planned Features](#6-planned-features).

1. **The Codex**: the author's story bible, built from guided, user-defined sections.
2. **Context-scoped AI writing**: short passages, drafted scene by scene, in the author's voice.
3. **Author-owned data**: no lock-in, no hidden AI markup, a path to local-first.

### The thesis

> **Context poisoning is the enemy of long-form creative writing.**
> AI writes well in short bursts with exactly the right context. It writes generic filler when
> it gets too much. Today the author has to work out what that right amount is, by hand, for
> every prompt. Mytherion does it for them.

### What Mytherion is not

- **Not a book generator.** The AI never "writes the novel". It drafts the next passage of a
  scene the author has planned, and the author accepts, edits or rejects it.
- **Not a chat wrapper.** The author does not write prompts. They plan scenes, and Mytherion
  builds the prompt.
- **Not AI-dependent.** Codex and manuscript are a complete writing tool on their own. AI is an
  opt-in layer, which matters because many writing communities are wary of AI.

---

## 2. The Problem

Writers already using AI for fiction describe a consistent picture:

- Models lose the plot and drift in quality once a generation runs past a few thousand words.
- The working method that holds up is to **divide and conquer**: outline → chapter beats →
  scene-level drafts of 1–2k words, assembled by hand.
- Feeding whole chapters, or even whole scenes, as context often makes the output *worse*. The
  model loses focus and falls back to its default voice.
- So the author ends up acting as a full-time **context manager**, copying lore snippets,
  summaries and style notes into every prompt.

Existing tools cover pieces of this. Novelcrafter pairs a codex with scene context, but mostly
includes whole entries when they are mentioned. Sudowrite is built for drafting. General
chatbots offer no structure at all. None makes *minimum-necessary* context its core design goal.

---

## 3. The Three Pillars

### 3.1 The Codex: guided freedom

The Codex is everything the author records about their story: characters, locations, cultures,
items, and anything else they choose to track.

- **User-defined, but guided.** Entries are built from sections the author adds, removes and
  renames. Templates (e.g. a "Character" template suggesting Appearance, Voice, Psychology,
  Relationships) give structure without boxes. Full blank-canvas freedom is deliberately *not*
  the goal. The guidance is part of the product.
- **One generic section shape** with a few field types (text, long text, list, quantity, link)
  replaces one hardcoded class per section. Templates and author choices sit on top of it.
- **Sections carry a context role** (e.g. *voice*, *sensory*, *relationships*, *backstory*,
  *current state*). This is what lets the AI layer pick pieces of an entry instead of the whole
  thing, and it is why the Codex cannot be totally free-form.
- **The author is in control** of what goes in. Mytherion never adds to the Codex without the
  author accepting it.

### 3.2 Context-scoped AI writing

The unit of work is a **passage**: a short burst of prose inside a **scene**.

#### The Context Pack

For every passage, Mytherion assembles a small **Context Pack** from layers:

| Layer | Contents | Supplied by |
|---|---|---|
| **The ask** | What this passage should do, in 1–2 lines | Author, or the next beat on the Scene Card |
| **Immediate prose** | The last few hundred words of the current scene, raw | Automatic |
| **Scene Card** | POV, characters present, location, the scene's goal or conflict, beats | Author, while planning the scene |
| **Codex slices** | Only the sections each present character and the location need for *this* scene, chosen by context role | Automatic |
| **Story so far** | A summary chain, more compressed the further back it goes: previous scene → chapter → story | Generated when a scene is finished, editable by the author |
| **Voice** | A few passages of the author's own prose (same POV or mood where possible) plus a short style sheet (tense, person, habits, words to avoid) | Automatic selection from the manuscript; the style sheet is written by the author |

Design rules:

- **Old prose never goes in as context.** Anything before the immediate window reaches the AI
  only as a summary. Summaries are first-class data on every scene and chapter, not an
  afterthought.
- **Voice is a primary lever.** Generic output usually means the model fell back to its default
  style, not that it lacked lore. The author's own prose is the strongest correction.
- **The pack is visible and adjustable.** Before generating, the author can see exactly what
  will be sent and toggle any piece. Control is the point.
- **The budget is small by design.** The pack has a fixed, modest size, tuned by experiment,
  not by how much fits in the model's window.

#### The passage loop

```
Scene Card ──► Context Pack ──► AI drafts a short passage
                    ▲                       │
                    │                       ▼
          edited text becomes     author accepts / edits / rejects
          the newest prose and
          a fresh voice sample
```

Every edit feeds the next passage, so the output moves toward the author's voice as they write.

#### Cold start

A new author has no manuscript to sample voice from. Onboarding asks for a few pages of
existing writing to seed the voice samples. How voice is stored has to allow for this from the
start.

#### Planning work, not prompt work

The management burden moves from *per prompt* (prompt engineering) to *per scene* (planning a
scene card), which writers already do when they outline. **You plan the scene; Mytherion briefs
the AI.**

### 3.3 Author-owned data

- **Full export, at any time,** in an open, documented format: the whole project, Codex,
  manuscript, summaries and media. Never a pile of loose files the author has to make sense of.
- **Bring your own key.** The author uses their own API key with their chosen provider. No
  forced subscription for AI, no markup on model costs.
- **No training, no harvesting.** Author content is never used for anything except serving the
  author.
- **Local-first is the likely destination.** Authors increasingly want software that runs on
  their machine, without a cloud account. The web app is the first delivery vehicle, but the
  architecture must not close the door (see §4.2). Desktop packaging is the **first item** on
  the Planned Features list, not a distant idea.

---

## 4. Architectural Direction

### 4.1 Core loop first

The context engine depends on three data structures, built in this order:

1. **Codex** with generic sections, templates and context roles.
2. **Manuscript** with chapters, scenes, Scene Cards and the summary chain.
3. **Context assembler + passage loop** on top of both.

Each step is useful without the next one: a Codex alone is a story bible, and Codex + Manuscript
is a writing tool without AI.

### 4.2 Keeping local-first possible

- **No cloud-proprietary dependencies** in the client or backend. Storage stays behind an
  interface (MinIO today, local disk tomorrow).
- **Strict REST contracts** between frontend and backend, so the UI can be packaged in a desktop
  shell (Tauri or Electron) unchanged.
- **Use Postgres features that have SQLite equivalents.** `jsonb` content maps to SQLite's JSON
  functions; avoid Postgres-only features in core models unless they can be swapped out.
- **AI calls are provider-agnostic** behind one interface, so a local model can be added later
  without touching the context engine.

**Open question: the backend on desktop.** A Spring Boot backend means shipping a JVM sidecar
inside the desktop app. Whether that is acceptable, or whether the desktop edition needs a
lighter backend, should be decided before the backend grows much further.

### 4.3 Routes

```text
/projects                        -> Projects (all of the author's projects)
/projects/[id]                   -> Project overview
/projects/[id]/codex             -> The Codex
/projects/[id]/codex/[entryId]   -> Single entry
/projects/[id]/manuscript        -> Chapters & scenes, writing view with Context Pack drawer
/projects/[id]/settings          -> Project settings, export, AI provider & key
```

---

## 5. Roadmap

### Phase 1: Codex foundation
- Replace the hardcoded section classes with generic sections + built-in templates (MYT-85).
- Add context roles to sections.
- Ship full project export early, so ownership is real from day one.

### Phase 2: Manuscript
- Chapters and scenes with a writing view.
- Scene Cards: POV, characters present, location, goal, beats.
- Scene and chapter summaries (written by hand at first).

### Phase 3: Context scoping & AI
- Context assembler and the visible, togglable Context Pack.
- Voice samples, style sheet and cold-start onboarding.
- One AI provider, bring-your-own-key.
- The passage loop: generate → accept / edit / reject.
- AI-generated summaries that the author can edit.

---

## 6. Planned Features

Valuable, but not part of the core loop. Ordered roughly by priority.

1. **Local-first desktop edition**: Tauri (preferred) or Electron shell, embedded database
   (SQLite), local file storage. Depends on resolving the backend-on-desktop question in §4.2.
2. **Single-file project package** (`.mytherion`): a structured archive of data + media,
   portable across machines.
3. **Multiple AI providers** (Claude, OpenAI, Gemini, OpenRouter) and **local inference**
   (e.g. Ollama) for authors who want zero cloud.
4. **Story-time state**: Codex facts that change over the story (what a character knows, who is
   alive, as of a given chapter), so context is true *at that point*.
5. **Manuscript compilation**: DOCX (standard manuscript format), EPUB, PDF/Markdown.
6. **Version history**: draft snapshots and milestone "commits" with visual diffs.
7. **Planner**: act structures, beat sheets, plot threads, arcs, chronology vs. story order.
8. **Backlinks**: `@character` / `[[location]]` mentions in prose linked to the Codex.
9. **Shared entries** across projects (recurring characters in a series).
10. **Global search** across projects.
11. **Multi-model "council"**: polling several models for one passage.
12. **Admin UI** for user management.

---

## 7. Proposed Terminology

These terms are used above but are **not yet in [terminology.md](./terminology.md)**. Per its
rule, they must be agreed and added there before code uses them.

| Term | Meaning |
|---|---|
| Manuscript | The prose of a project: chapters and scenes |
| Chapter | An ordered group of scenes |
| Scene | The atomic unit of writing and of context assembly |
| Scene Card | A scene's planning metadata: POV, characters present, location, goal, beats |
| Passage | One short burst of prose drafted within a scene |
| Context Pack | The assembled, minimum-necessary context sent to the AI for one passage |
| Context role | The tag on a section saying what it is *for* (voice, sensory, …) |
| Summary chain | The scene → chapter → story summaries that stand in for older prose |
| Voice sample / Style sheet | The author's own prose and style notes used to match their voice |

Note: `EntryType` is currently a system-defined enum. User-defined types built from templates
will change that, and `terminology.md` will need updating when it does.
