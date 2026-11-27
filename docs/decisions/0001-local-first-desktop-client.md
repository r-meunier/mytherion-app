# 0001: Local-first desktop client

**Status:** Accepted, 2026-11-24. The project file format (§4) is a draft, to be settled by the spike (§8).
**Resolves:** the "backend on desktop" open question in
[product-vision-and-roadmap.md](../product-vision-and-roadmap.md) §4.2.

---

## 1. Context

The original idea for Mytherion was a privacy-first writing environment that works the way Claude Code
does: the author's work lives in files on their own machine, and tools, including AI, operate on those
files. The web MVP went in a different direction: a Spring Boot backend, Postgres, MinIO, accounts,
email verification and tenant isolation.

The roadmap already names local-first as the destination (§3.3) and a desktop edition as Planned Feature #1,
but left open what happens to the backend on desktop.

Two facts make this the right time to decide:

- **The backend is still small.** About 75 Kotlin files and two migrations. A large share of it (auth, JWT
  cookies, email verification, `ProjectAccessInterceptor`) exists only because the app is multi-user and
  hosted. A single-user local app needs none of it.
- **The frontend already has a clean seam.** Components never talk to the backend directly. Every call goes
  through a typed service object in `app/services/*` (`codexService`, `projectService`, …). Replace what is
  behind those services and the UI does not notice.

## 2. Decision

Build a **desktop client as a second app in this monorepo**, reusing the existing UI.

1. **Shell:** Tauri.
2. **No JVM on desktop.** The Spring Boot backend is not shipped. The desktop client implements the same
   service interfaces locally, in TypeScript, using Tauri's file-system and SQL plugins.
3. **Files are the source of truth.** A project is a folder of human-readable files (§4). SQLite is only a
   rebuildable index for search and listing.
4. **The UI is shared, not copied.** Components, styles, types, slices and service *interfaces* move to a
   shared package. Each app provides its own service *implementations* (§5).
5. **The web app continues** on the Spring Boot backend. Whether it survives long term is left open (§9).

## 3. Why files, not a database

Choosing files is what turns this from "the web app in a desktop window" into the original idea:

- **AI-agent friendly.** An agent can read, search and edit a project the way Claude Code edits a repo,
  with no API layer in between.
- **Version history comes for free.** The author, or the app, can put the folder under git. This covers most
  of Planned Feature #6.
- **No lock-in, by construction.** Export is not a feature to build later (§3.3, Phase 1). The working format
  is already open and documented.
- **Other tools work.** The author can open an entry in any Markdown editor, sync the folder with their own
  cloud drive, or back it up by copying it.

The cost: the app must cope with files changing underneath it (§4.4), and queries go through an index
rather than straight to SQL.

## 4. Project format (draft)

### 4.1 Layout

```
my-novel/
├── project.json
├── codex/
│   ├── characters/
│   │   └── mira-vell.md
│   ├── locations/
│   │   └── the-drowned-quarter.md
│   └── …                      one folder per EntryType
├── media/
│   └── 3f2c….png              thumbnails, named by entry id
└── .mytherion/
    └── index.sqlite           cache; gitignored, safe to delete
```

The manuscript (Phase 2) will add `manuscript/` with one file per scene. Its format is decided with the
manuscript model, not here.

### 4.2 `project.json`

```json
{
  "formatVersion": 1,
  "id": "0d9c…",
  "name": "The Drowned Quarter",
  "description": "A cartographer maps a city that keeps sinking.",
  "genre": "Fantasy",
  "settings": {}
}
```

These are the fields of `Project` today, minus `owner`. `formatVersion` lets later versions migrate older
folders.

### 4.3 Codex entry

One Markdown file per entry. The YAML frontmatter holds the structured data, and the body holds the prose.
It maps one-to-one onto `CodexEntry` and `EntryContent` as described in
[codex-entry-model.md](../codex-entry-model.md):

```markdown
---
id: 7b1e…
type: CHARACTER
name: Mira Vell
aliases: [The Cartographer]
tags: [protagonist, cartographer]
thumbnail: media/7b1e….png
templateId: character-basic
details:
  - id: b7e…
    label: Story role
    value: Protagonist
    role: IDENTITY
  - id: d42…
    label: Voice
    value: |
      Clipped, dry humour; never says sorry.
    hint: How do they talk? Rhythm, vocabulary, verbal tics.
    role: VOICE
---

## Description

A disgraced cartographer who charts the flooded districts nobody else will enter.

## Notes

Private scratchpad.
```

Rules:

- **`id` is the identity**, not the filename. The filename is a slug of the name, and renaming the entry
  renames the file. A folder's name is a convenience; when it disagrees with `type`, the `type` field wins.
- The body has two reserved headings, `## Description` and `## Notes`. Text under any other heading stays
  part of the description, so hand edits are never lost.
- The validation rules from codex-entry-model.md §3 apply unchanged: labels are non-empty, detail ids are
  unique, sizes are capped.
- Unknown frontmatter keys are kept on write, so an agent or a newer version can add data without an older
  client throwing it away.

### 4.4 Index and outside edits

- `.mytherion/index.sqlite` holds what lists and search need: entry id, type, name, aliases, tags, path and
  a content hash. It can be rebuilt from the files at any time, so it is never backed up or synced.
- A file watcher re-indexes changed files. Files will change outside the app, through the author's editor,
  git or an AI agent, and that is a supported case, not an error.
- **Conflicts:** this replaces the `@Version` optimistic lock. Before a write, the client checks the file's
  hash against what it loaded. If the file changed on disk since then, the user sees the same "changed
  elsewhere" error the web app shows for a version conflict.

### 4.5 Relation to the `.mytherion` package

Planned Feature #2, the single-file `.mytherion` package, becomes a zip of this folder. It is for moving a
project between machines, not the format the app works in.

The web app's project export (`GET /api/projects/{projectId}/export`, "Export Project" on the project
dashboard) already writes this zip, from `ProjectFolderWriter`. It is the reference implementation of
§4.1–4.3 until the desktop client exists.

## 5. Sharing the UI

### 5.1 Repo layout

```
mytherion-app/
├── packages/ui/            components, styles, types, slices, service interfaces
├── mytherion-frontend/     web: Next.js + HTTP service implementations
├── mytherion-desktop/      Tauri + Vite: local service implementations
└── mytherion-backend/      Spring Boot, web only
```

We are **not** using a long-lived git branch. A branch drifts from `develop`, and every UI fix would have to
be cherry-picked across.

### 5.2 The service seam

Each service gets an explicit interface in `packages/ui`, extracted from today's object shapes:

```ts
export interface CodexService {
  getTemplates(type: EntryType): Promise<EntryTemplate[]>
  getEntries(projectId: string, filters?: EntryFilters): Promise<Page<CodexEntry>>
  getEntry(projectId: string, id: string): Promise<CodexEntry>
  createEntry(projectId: string, data: CreateEntryRequest): Promise<CodexEntry>
  updateEntry(projectId: string, id: string, data: UpdateEntryRequest): Promise<CodexEntry>
  deleteEntry(projectId: string, id: string): Promise<void>
}
```

- **Web:** the existing axios implementations, unchanged.
- **Desktop:** implementations that read and write the project folder and query the index.
- **Errors:** the desktop implementations throw the same `ErrorCode`-shaped errors as the web API
  (`types/apiError.ts`), so the UI's existing error handling keeps working.
- **Wiring:** each app resolves `@/services` to its own implementations through a build-time alias. This
  avoids runtime injection and leaves call sites unchanged.
- **Templates:** they are read-only JSON today (`src/main/resources/codex/templates/`). They move to one place
  that both the backend and the desktop app read.

### 5.3 Next.js coupling

About 20 non-test files import from `next/*`, mostly `Link`, `useRouter` and `useParams`. Tauri serves a
static bundle, and Next's static export cannot serve `/projects/[projectId]/…` routes for ids that are only
known at runtime.

- The desktop app uses **Vite + React Router**, with the same URL hierarchy.
- Shared components go through small adapters (`AppLink`, `useAppRouter`, `useAppParams`). Each app maps
  them to its own router.
- `proxy.ts`, the redirects in `next.config.ts`, and the login, register and verify-email pages stay in the
  web app only.

### 5.4 What the desktop client leaves out

These are dropped from desktop: accounts, login, `authSlice`, email verification and Mailhog, MinIO (media
goes in `media/`), tenant isolation and the `ProjectAccessInterceptor`. The project list becomes a list of
recently opened folders.

## 6. Privacy and AI

- **No account and no telemetry by default.** The app makes network calls only when the author asks for
  them: AI requests, plus an optional update check.
- **API keys stay out of the project folder.** Keys are stored in the OS keychain, so a project can be shared
  or committed without leaking them.
- **AI is honest about what leaves the machine.** With bring-your-own-key, the Context Pack is exactly what
  is sent to the provider, and the author can see and toggle it (roadmap §3.2). Local inference such as Ollama
  remains the zero-cloud option (Planned Feature #3).

## 7. Distribution

- **Windows:** unsigned installers trigger a SmartScreen warning. Sign with Azure Trusted Signing or an OV
  certificate. Even signed builds can warn until they build download reputation.
- **macOS:** Apple Developer Program membership, then sign with Developer ID and notarize. Without that,
  Gatekeeper blocks the app.
- **Early test builds** may ship unsigned, with first-run instructions. Signing is required before a public
  release.

## 8. Spike: proving it before restructuring

The spike is done when a Tauri window can do the following:

1. Open a project folder made by hand in the §4 format.
2. Show the **existing** codex list and entry page components, unmodified apart from the router adapters.
3. Edit an entry and save it back to the `.md` file.
4. Pick up an edit made to that file in an outside editor.

The spike may copy components into `mytherion-desktop/` instead of extracting `packages/ui`. Extracting the
package comes after the spike succeeds, and is mostly moving files.

## 9. Alternatives considered

| Option | Why not |
|---|---|
| Ship Spring Boot as a JVM sidecar, with H2 or SQLite | 80–150 MB install and a JVM start-up delay, plus auth and tenant code with no job to do. It is the web app in a box, not a local-first app. |
| GraalVM native image of the backend | Fixes start-up time, but Spring, Hibernate and reflection make native builds fragile, and it keeps the multi-user code. |
| Electron instead of Tauri | Larger installs and higher memory use. The roadmap already prefers Tauri. Reconsider only if a Node-only dependency forces it. |
| SQLite as the source of truth | Simpler queries, but the author's work becomes opaque to agents, editors and git. That loses the point of §3. |
| One project file, as Inkgrove does | Easy to move around, but an agent or editor cannot work on it directly. Kept as the transfer format instead (§4.5). |
| Long-lived git branch for desktop | Drift and cherry-picks (§5.1). |

## 10. Consequences

- Every service has two implementations. Shared tests should run each one against the same fixtures.
  `scripts/check_contract_parity.py` only covers web ↔ backend.
- A change to the entry model must update both the backend (JSONB) and the file format (§4.3). The entry
  model doc remains the single description of both.
- The backend's multi-user code keeps serving the web app only. Nothing new should be built there that the
  desktop client also needs. Shared logic belongs in `packages/ui` or in data files, such as the templates.

## 11. Open questions

- **Does the web app survive?** If desktop becomes the product, the web app could shrink to an optional sync
  or backup service, or be retired.
- **Notes location.** Should notes live in the entry body (as drafted) or in a separate file, so that sharing
  or committing a project can leave private notes out?
- **Sync and collaboration.** Out of scope for now. Files on disk leave room for git-based, cloud-folder or
  custom sync later.
- **Linux and mobile.** Tauri supports both. Not planned yet.
