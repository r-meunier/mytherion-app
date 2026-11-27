# Story Model: Plan and Write

**Status:** Agreed baseline for the story epic MYT-93 (adapt as we learn); terms are in
[terminology.md](./terminology.md)
**Builds on:** [product-vision-and-roadmap.md](./product-vision-and-roadmap.md) §3.2 and §5 Phase 2,
[decisions/0001-local-first-desktop-client.md](./decisions/0001-local-first-desktop-client.md) §4

---

## 1. The idea in one paragraph

Mytherion is a writing app, so the prose gets two sections of its own beside the Codex: **Write**, where
the author drafts scene by scene, and **Plan**, where they shape the story before and while they write.
Both work on one tree, the **story**: **acts** contain **chapters**, chapters contain **scenes**. The act
layer comes from a **structure** the author picks (Three-Act, Five-Act, Save the Cat, Hero's Journey, …),
the same way a Codex template decides which details an entry starts with. Each act carries the
structure's **beats** as planning prompts, and a scene can be pinned to the beat it delivers.

---

## 2. Names

| UI | Code | Meaning |
| :--- | :--- | :--- |
| **Write** | route `/projects/[id]/write` | Drafting: the story tree and the scene editor |
| **Plan** | route `/projects/[id]/plan` | Planning: structure, beats, Scene Cards |
| Story | `story` (backend domain) | A project's acts, chapters and scenes. One story per project |
| Structure | `StoryStructure` | A template that creates the acts and beats (Three-Act, Save the Cat, …) |
| Act | `Act` | Top level of the story, created from the structure; holds chapters and beats |
| Beat | `Beat` | A planning prompt inside an act ("Inciting incident, around 10%") |
| Chapter | `Chapter` | An ordered group of scenes |
| Scene | `Scene` | The unit of writing and of AI context assembly |
| Scene Card | fields on `Scene` | The scene's planning data: POV, characters present, location, goal, beat, summary |

"Manuscript" is retired as a UI and code name. Once this document is agreed, these terms go into
[terminology.md](./terminology.md) before any code uses them (its rule), replacing the proposed
Manuscript entries in the roadmap's §7.

---

## 3. The tree

```
Story (one per project)
└── Act I: Setup                     ← from the structure; renameable, reorderable
    ├── beats: Hook · Inciting incident · First plot point
    ├── Chapter 1: The Drowned Quarter
    │   ├── Scene 1  [Hook]          ← pinned to a beat (optional)
    │   └── Scene 2
    └── Chapter 2 …
└── Act II: Confrontation
└── Act III: Resolution
```

- Every story has at least one act. **Free Form** creates a single act; while a story has only one act,
  Write and Plan don't show the act level at all, so writers who don't plot by acts never see it.
- Acts, chapters and scenes are ordered and can be added, renamed, reordered and moved (a chapter to
  another act, a scene to another chapter). Deleting asks first and is a soft delete, like entries.
- Chapters and scenes are numbered by position for display; titles are optional ("Chapter 3",
  "Untitled scene" until named).

---

## 4. Structures

Built-in templates, read-only data like the Codex templates (JSON in
`mytherion-backend/src/main/resources/story/structures/`). A structure only **creates** acts and beats;
after that the author owns them and can edit everything.

| Structure | Acts | Beats |
| :--- | :--- | :--- |
| Free Form | 1 | none |
| Three-Act | Setup, Confrontation, Resolution | Hook, Inciting incident, First plot point, Rising action, Midpoint, Second plot point, Climax, Resolution |
| Five-Act (Freytag) | Exposition, Rising Action, Climax, Falling Action, Dénouement | one per act |
| Save the Cat | Act One, Act Two, Act Three | the 15 beats, Opening Image to Final Image |
| Hero's Journey | Departure, Initiation, Return | the 12 stages, Ordinary World to Return with the Elixir |
| Seven-Point | Setup, Middle, End | Hook, Plot Turn 1, Pinch 1, Midpoint, Pinch 2, Plot Turn 2, Resolution |
| Kishōtenketsu | Ki, Shō, Ten, Ketsu | one per part |

Each beat has a name, a hint (what it is for, one or two sentences) and a rough position in the story
(e.g. "around 10%"), which Plan uses to show whether the draft's beats land where the structure expects.

**Picking a structure** happens when the story is first opened (Free Form preselected). Changing it later
is possible but not automatic: the new acts are added, and the author moves chapters into them.

---

## 5. Scenes

A scene holds:

| Field | For | Slice |
| :--- | :--- | :--- |
| `title` | Optional name | Write |
| `content` | The prose, as Markdown | Write |
| `wordCount` | Kept on save, summed per chapter, act and story | Write |
| `status` | `DRAFT`, `REVISED`, `DONE` | Write |
| `summary` | What happens, in a few lines; written by hand now, AI-suggested later (summary chain) | Plan |
| `povEntryId` | Point-of-view character, a Codex entry | Plan |
| `characterIds` | Characters present, Codex entries | Plan |
| `locationEntryId` | Where it happens, a Codex entry | Plan |
| `goal` | The scene's goal or conflict | Plan |
| `beatId` | The beat this scene delivers, if any | Plan |
| `version` | Optimistic locking, like entries | Write |

These Scene Card fields are exactly what the Context Pack (vision §3.2) reads later: POV, characters and
location pick the Codex details by context role; summaries form the "story so far". Nothing here is
AI-only; each field is useful to a writer on its own.

---

## 6. Write (first slice)

```
┌ Story ─────────────┬─────────────────────────────────────────────┐
│ ▾ Act I: Setup     │  Chapter 1 › Scene 2              1,204 words │
│   ▾ Chapter 1      │                                              │
│      Scene 1       │  The rain had not stopped for three days,    │
│    ● Scene 2       │  and the water in the Drowned Quarter had    │
│      + Scene       │  climbed past the second-floor sills…        │
│   ▸ Chapter 2      │                                              │
│   + Chapter        │                                              │
│ ▸ Act II           │                                       Saved  │
└────────────────────┴─────────────────────────────────────────────┘
```

- **Left:** the story tree. Add, rename, reorder (drag, plus up/down buttons for keyboard use), move and
  delete acts, chapters and scenes. Word counts per chapter and act.
- **Centre:** one scene in a calm, distraction-free editor: a readable column width, a serif writing font,
  no chrome beyond the breadcrumb and word count. Basic formatting only (italic, bold, scene break),
  everything Markdown can hold.
- **Saving:** continuous autosave while typing (debounced, a second or two after the last keystroke), plus
  on leaving the scene and before the page unloads, with the same "Saving… / Saved / Not saved" status and
  version handling as the entry page. Typing must never wait on the network.
- **Later in Write:** focus mode (hide everything but the text), targets (words per day / per chapter),
  search across the story, split view with a Codex entry.

**Editor:** TipTap (ProseMirror), with the content stored as Markdown so the export and the desktop
client get plain files (ADR 0001). Confirming that TipTap round-trips our subset of Markdown losslessly
is the first task of the slice.

---

## 7. Plan (second slice)

- **Structure view:** acts as columns, each with its beats; scenes appear under the beat they're pinned to,
  unpinned ones at the end of their act. A bar shows where each beat lands in the draft (by word count)
  against the structure's expected position.
- **Scene Cards:** the cards in the structure view; open one to edit summary, POV, characters, location,
  goal and beat. Characters and locations are picked from the Codex.
- **Outline view:** the whole tree as a list of chapters with each scene's summary, for reading the story
  at a glance.
- Planning and writing share data: a scene planned in Plan is the scene written in Write.

---

## 8. Storage and API

Backend domain `story` (Kotlin, by domain like `codex`), new Flyway migration, all routes under
`/api/projects/{projectId}/story/**` so the `ProjectAccessInterceptor` covers them.

```
GET    /story                         the tree: acts → chapters → scenes (no scene content)
POST   /story/structure               pick a structure (only while the story is empty)
GET    /api/story/structures          built-in structures (not project-scoped, like templates)
POST   /story/acts | chapters | scenes            create
PATCH  /story/acts|chapters|scenes/{id}           rename, move, reorder (position + parent), edit fields
DELETE /story/acts|chapters|scenes/{id}           soft delete
GET    /story/scenes/{id}             one scene with its content
PATCH  /story/scenes/{id}/content     save prose (content + version), returns the new version and word count
```

- Ordering: an integer `position` per parent, renumbered on move. Simple, and the tree is small.
- Beats live on their act (jsonb list of `{id, name, hint, position}`), like details on an entry.
- Scene content is a `text` column; the tree endpoint never returns it, so opening Write stays fast.

**Export** (ADR 0001 §4.1 leaves the format to this document): the project folder gains `story/`, one
Markdown file per scene with its Scene Card as frontmatter, in folders per act and chapter:
`story/01-setup/01-the-drowned-quarter/02-scene-title.md`, plus `story/story.json` with the structure,
acts, beats and chapter titles. Order comes from the numeric prefixes; ids in the frontmatter are the
identity.

---

## 9. Not in these slices

AI drafting and the Context Pack (Phase 3), version history and snapshots, comments, compiling to
DOCX / EPUB / PDF, multiple stories per project, collaborative editing, a user-defined structure editor
(authors can rename and edit acts and beats, but not save their own structures as templates yet).

---

## 10. Open questions

- **Beats without acts:** should Free Form stories get beats at all? (Proposed: no.)
- **Scene status values:** are `DRAFT / REVISED / DONE` the right three, or should authors define their own?
- **Chapter-less scenes:** some writers think in scenes only. Proposed: every scene lives in a chapter,
  but a story with one chapter hides the chapter level the way one act hides the act level.

---

## 11. Work breakdown

| Slice | Tickets |
| :--- | :--- |
| Groundwork | Terminology + this doc agreed · TipTap Markdown spike · `story` domain, migration, structures as JSON |
| **Write** | Tree API (CRUD, move, reorder) · Scene content API with versioning · Write page: tree · Write page: editor + autosave + word counts · Structure picker on first open · Sidebar: Plan / Write replace Story Planner / Manuscript · Export `story/` |
| **Plan** | Structure view with beats · Scene Cards with Codex pickers · Outline view · Beat position bar |
