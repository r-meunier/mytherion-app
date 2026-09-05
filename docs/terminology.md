# Mytherion Terminology Standard

Status: **agreed 2026-09-05**. This is the canonical vocabulary. When code and this document
disagree, this document wins and the code is a bug.

---

## The rule

> **One concept has one code name everywhere** — backend, frontend, database, API, tests.
> The UI may show a different word, but only through a single presentation layer,
> never by renaming code.

Most of the drift this replaces came from having three vocabularies (database, code, UI) with no
rule about which one wins where, plus two half-finished renames that left fossils behind.

---

## Canonical vocabulary

| Concept | Code name (everywhere) | UI label | Notes |
|---|---|---|---|
| The feature module | `codex` | "Codex" | The whole feature-set, not a record |
| A record inside it | `CodexEntry` / `entry` / `entries` | "Entry" | See *Why "Entry"* below |
| What kind of entry | `EntryType` | "Type" | System-defined enum |
| A data block on an entry | `EntrySection` / `SectionType` | "Section" | Was `EntityComponent` |
| The container | `Project` / `project` | "Project" | **Never "World"** |
| Entry picture | `thumbnail` | "Thumbnail" | One per entry, MVP |
| Free-form labels | `tags` | "Tags" | The only user-defined grouping |
| Stats aggregation | `dashboard` | — | Internal only; never a page name |
| Projects list page | `projects` | "Projects" | Route group `(projects)` |
| Single project landing | `overview` | "Overview" | |

### Banned words

| Word | Why | Use instead |
|---|---|---|
| `Entity` | Collides with JPA `@Entity`; every persisted class is an entity | `CodexEntry` |
| `Component` | Collides with React's core noun | `EntrySection` |
| `World` | Implies a worldbuilding-only product; blocks the writing-app direction | `Project` |
| `Element` | Collides with DOM `Element` / `HTMLElement` / `ReactElement` | `CodexEntry` |
| `Record` | Collides with TypeScript's built-in `Record<K,V>` | `CodexEntry` |
| `Entry` *as a page or module name* | It is a record, not a screen | `Codex` |
| `Dashboard` *as a page name* | Reserved for stats aggregation | `Projects` / `Overview` |

### Why "Entry"

It matches NovelCrafter, which is the reference product users will arrive from ("New Entry",
"Search all entries…", "1 entry"). It has no collision in either stack: `@Entity class CodexEntry`
is unambiguous, and `Entry` is not a built-in TypeScript type. The alternatives are all worse
collisions than the word being replaced — `Element` and `Record` are both taken by the frontend
stack, and `Item` is already an `EntryType` value.

---

## Rename map

### Backend

| Before | After |
|---|---|
| package `io.mytherion.entity` | `io.mytherion.codex` |
| `Entity` | `CodexEntry` |
| `EntityType` | `EntryType` |
| `EntityMetadata(components)` | `EntryContent(sections)` |
| `EntityComponent` | `EntrySection` |
| `ComponentType` | `SectionType` |
| `BioComponent`, `AppearanceComponent`, … | `BioSection`, `AppearanceSection`, … |
| `EntityService` / `EntityQueryService` | `CodexEntryService` / `CodexEntryQueryService` |
| `EntityRepository` (+`Custom`/`Impl`) | `CodexEntryRepository` (+`Custom`/`Impl`) |
| `EntityController` | `CodexEntryController` |
| `EntityNotFoundException` | `EntryNotFoundException` |
| `EntityAccessDeniedException` | `EntryAccessDeniedException` |
| `ImageNotFoundException` | `ThumbnailNotFoundException` |
| `ImageDeletionException` | `ThumbnailDeletionException` |
| `uploadImage` / `deleteImage` | `uploadThumbnail` / `deleteThumbnail` |
| table `entities` | `codex_entries` |
| package `io.mytherion.category` | **deleted** |

### API

| Before | After |
|---|---|
| `/api/projects/{projectId}/entities` | `/api/projects/{projectId}/entries` |
| `POST .../entities/{id}/image` | `POST .../entries/{id}/thumbnail` |
| `DELETE .../entities/{id}/image` | `DELETE .../entries/{id}/thumbnail` |
| `?categoryId=` filter | **removed** |
| `/api/dashboard/stats` | unchanged |

`UploadResponse` stays generic and stays in `platform/storage` — it is storage-shaped, not
entry-shaped, and is exactly what the future multi-image system will reuse. The *entry's field* is
`thumbnail`; the storage DTO keeps `url`.

### Frontend

| Before | After |
|---|---|
| `types/entity.ts` | `types/codex.ts` |
| `services/entityService.ts` | `services/codexService.ts` |
| `store/entitySlice.ts` | `store/codexSlice.ts` |
| `EntityCard`, `EntityList`, `EntityForm`, `EntityModal`, `EntityFilters` | `Entry*` equivalents |
| `EntityTypeSelector` | `EntryTypeSelector` |
| `components/codex/metadata/` | `components/codex/sections/` |
| `ComponentDispatcher` | `SectionDispatcher` |
| `EntityMetadataEditor` | `EntrySectionsEditor` |
| `mediaService.uploadEntityImage` | `mediaService.uploadEntryThumbnail` |
| `mediaService.getImageUrl` | `mediaService.getThumbnailUrl` |
| route `[entityId]` | `[entryId]` |
| route group `(dashboard)` | `(projects)` |
| `CategorySelector` | **deleted** |
| "Your Worlds" / "Create World" / "Edit World" | "Projects" / "New Project" / "Edit Project" |

---

## `EntryType` vs `SectionType`

These were the sharpest source of confusion: six identical value names meaning different things.

```
EntryType.LOCATION            "this entry IS a location"
SectionType.LOCATION_DETAILS  "this entry HAS location data attached"
```

`EntryType` values are unchanged (7): `CHARACTER`, `ORGANIZATION`, `CULTURE`, `SPECIES`,
`LOCATION`, `ITEM`, `CUSTOM`.

`SectionType` values (19), in three groups:

- **Generic**, usable on any entry — unchanged:
  `BIO`, `APPEARANCE`, `PSYCHOLOGY`, `SOCIAL`, `HISTORY`, `ORIGINS`, `PERSPECTIVES`, `CUSTOM`
- **Type-specific detail blocks** — suffixed to break the collision:
  `CULTURE` → `CULTURE_DETAILS`, `LOCATION` → `LOCATION_DETAILS`,
  `ORGANIZATION` → `ORGANIZATION_DETAILS`, `SPECIES` → `SPECIES_DETAILS`,
  `ITEM` → `ITEM_DETAILS`
- **Relation blocks** — unchanged except one normalisation:
  `CHARACTER_RELATIONS`, `CULTURE_RELATIONS`, `LOCATION_RELATIONS`, `SPECIES_RELATIONS`,
  `ITEM_RELATIONS`, and `ORG_RELATIONS` → `ORGANIZATION_RELATIONS`

`SectionType` values are `@JsonSubTypes` discriminators persisted inside the `jsonb` column, so
renaming them changes stored data. This is done now, pre-release, while the fix is free.

---

## Classification: one axis removed

An entry carried three overlapping classification axes:

```
type      EntryType    required, system-defined
category  Category?    optional, single, user-defined   <- removed
tags      String[]     optional, multiple, user-defined
```

`Category` was not competing with `EntryType` — it was competing with `tags`, and lost. Both were
optional user-defined grouping; one by reference, one by string. `Category` is removed for the MVP
and `tags` is the single user-defined axis, matching how NovelCrafter uses labels.

This reverts the category filter added in MYT-69. If per-project named collections are wanted
later, they should return as a deliberate feature with a distinct job (a folder an entry lives
*in*), not as a second labelling system.

---

## Enforcement

Naming conventions decay without a check. Enforced mechanically where possible:

- ArchUnit rules in `PackageStructureTest` cover package placement.
- The banned-word list above should become a lint/grep check in CI so `Entity`, `Component` and
  `World` cannot re-enter the vocabulary unnoticed.

Anything this document does not name is not yet standardised — add it here first, then write the
code.
