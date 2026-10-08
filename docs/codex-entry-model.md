# Codex Entry Model: Details and Templates

**Status:** Agreed baseline for MYT-85 (adapt as we learn)
**Replaces:** the 19 hardcoded `SectionType`s and their per-type classes, interfaces and editors

---

## 1. The idea in one paragraph

An entry is a **name, a description and a list of details**. Details are short label/value pairs the
author controls ("Story role: Protagonist", "Voice: clipped, dry humour…"). **Templates** decide which
details a new entry starts with: none (Blank), a handful (Basic) or many (Full). After creation every
entry behaves the same. The model follows the page layout, which is modelled on Novelcrafter's character
entry.

---

## 2. The entry page

```
┌──────────────────┬─────────────────────────────────────────────┐
│  [ thumbnail ]   │  Mira Vell                      Character    │
│                  │  protagonist · cartographer          (tags)  │
│  Details         │  aka The Cartographer, Mira of the…  (aliases)│
│  Story role  …   │                                              │
│  Pronouns    …   │  [ Overview ]                       (tabs)   │
│  Occupation  …   │                                              │
│  Appearance  …   │  Description                                 │
│  Voice       …   │  A disgraced cartographer who charts the     │
│  + Add detail    │  flooded districts nobody else will enter…   │
└──────────────────┴─────────────────────────────────────────────┘
```

- **Left sidebar:** thumbnail on top, then the details.
- **Main column:** name, type, tags, aliases, then tabs. For now the only tab is **Overview**, holding the description.
- Every entry type uses this layout; only the starting details differ.
- **Later:** Relations, Mentions, more tabs, custom detail field types (e.g. a dropdown for Story role).

---

## 3. The data

```
CodexEntry
├── type, name, tags, thumbnail      unchanged
├── aliases[]                        NEW: plain list of names (column, like tags)
├── description                      unchanged: long prose, Overview tab
├── notes                            unchanged: private scratchpad (placement open, see §6)
└── content (jsonb)
      ├── templateId                 which template it was created from
      └── details[]
            └── { id, label, value, hint?, role? }
```

```json
{
  "templateId": "character-basic",
  "details": [
    { "id": "b7e…", "label": "Story role", "value": "Protagonist", "role": "IDENTITY" },
    { "id": "c1a…", "label": "Pronouns", "value": "she/her", "role": "IDENTITY" },
    { "id": "d42…", "label": "Voice", "value": "Clipped, dry humour; never says sorry.",
      "hint": "How do they talk? Rhythm, vocabulary, verbal tics.", "role": "VOICE" }
  ]
}
```

| Property | Meaning |
|---|---|
| `aliases` | Other names for the entry. A `text[]` column like `tags`, so names can later be detected in prose. One migration (pre-release, so it may be folded into `V1__init.sql`). |
| `templateId` | The template the entry was created from, e.g. `character-basic`. Provenance only; nothing depends on it staying accurate. |
| `detail.id` | UUID. Details are found by id, never by label. |
| `detail.label` | Free text; the author can rename it. |
| `detail.value` | Text, may be multi-line (a voice sheet is a paragraph). `null` when empty. |
| `detail.hint` | Optional help text, copied from the template at creation. Part of the entry, so it survives template changes and is exported with it. |
| `detail.role` | Optional **context role**: what the detail is for, so the AI Context Pack can pick it for a scene (§5). Stored now, no UI yet. |

**Validation (backend):** labels are non-empty; ids are unique within the entry; sane size limits (e.g. 100
details, a length cap per value). Values are always text, so there is no per-type validation.

---

## 4. Templates

Read-only JSON files shipped with the backend (e.g. `src/main/resources/codex/templates/character-basic.json`),
served by `GET /api/codex/templates?type=CHARACTER`.

```json
{
  "id": "character-basic",
  "entryType": "CHARACTER",
  "level": "BASIC",
  "name": "Basic character",
  "details": [
    { "label": "Story role", "role": "IDENTITY", "hint": "Protagonist, antagonist, mentor…" },
    { "label": "Voice", "role": "VOICE", "hint": "How do they talk? Rhythm, vocabulary, verbal tics." }
  ]
}
```

- Each `EntryType` has a list of templates with a `level` of `BLANK`, `BASIC` or `FULL`.
- Create flow: **New Character → choose template → the entry form**.
- On create, the frontend copies the template's details into the entry: new UUIDs, empty values, hints and
  roles copied. Changing a template only affects new entries.

**Starting Basic details (draft, refined in MYT-90):**

| Type | Details |
|---|---|
| Character | Story role, Pronouns, Occupation, Background, Physical appearance, Personality, Voice |
| Location | Region, Climate, Atmosphere, Notable features |
| Organization | Purpose, Leadership, Size, Base of operations |
| Culture | Values, Customs, Language |
| Species | Appearance, Lifespan, Habitat, Abilities |
| Item | Kind, Origin, Properties, Current owner |
| Custom | (Blank only) |

**Full** templates rebuild the old section fields as details (e.g. "External goal", "Internal need",
"Height") with hints, minus the relation fields, which return with the Relations feature.

---

## 5. Context roles (stored now, used later)

`IDENTITY` · `APPEARANCE` · `VOICE` · `MOTIVATION` · `BACKSTORY` · `SENSORY` · `CURRENT_STATE`

Templates preset roles. Details without a role still work; the Context Pack just can't pick them out
individually. The list will be revisited when the Context Pack is designed.

---

## 6. Open

- **`notes` placement:** a second tab, a small sidebar panel, or dropped for now.
- **Custom detail field types** (dropdown, number, link): later. Existing details default to text, so
  adding types is backwards compatible.

---

## 7. Compared with the current model

| | Current | New |
|---|---|---|
| Table columns | type, name, description, notes, tags, thumbnail, content | same, plus `aliases` |
| `content` | `{ sections }`: 19 hardcoded section types, ~120 fixed fields | `{ templateId, details }`: author-controlled label/value list |
| Backend section model | 496 lines, 20 files | a few small classes |
| Frontend types / editors | 303 + 1,155 lines, 10 editor files | ~40 lines + one details editor |
| CI parity | 19 types kept in sync | nothing to sync |

---

## Related

- [terminology.md](./terminology.md): `Detail`, `Template`, hint and context role are added in MYT-86.
- [product-vision-and-roadmap.md](./product-vision-and-roadmap.md) §3.1 (the Codex) and §3.2 (the Context Pack).
- Jira: MYT-85 (story) → MYT-86, MYT-87, MYT-90, MYT-88.
