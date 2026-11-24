# Style Guide: Pages Inside a Project

How pages inside a project are built, so moving between them doesn't make titles, headers or panels shift.
**The entry page (`/projects/[id]/codex/[entryId]`) is the reference.** If a page differs from it without a reason written down here, the page is wrong.

The tokens and utilities below live in `mytherion-frontend/app/styles/base.css` (see [css-architecture.md](./css-architecture.md)). This guide says which one to use where.

---

## 1. Rules

1. Every page inside a project uses `ProjectPageLayout` and `PageHeader`. Never assemble `AppHeader` + `DualSidebar` + `<main>` by hand.
2. Loading and error states render **inside** `ProjectPageLayout` (its `loading` and `error` props). They never swap out the whole page, because that makes the sidebar and background flicker.
3. A form keeps its fields mounted while it saves. Disable the fields; don't swap the form for a spinner, or a failed save throws away what the author typed.
4. Build with the shared classes (§5–§7). Don't use raw grays (`gray-700`, `gray-800`, `slate-*`) or raw purples (`purple-500`, `purple-600`) in project pages. The palette is white-with-opacity on the dark background, plus `primary`.
5. Don't put a `max-w-*` on page content. It uses the full width of the main area, as the codex grid does.

---

## 2. Page frame: `ProjectPageLayout`

`app/components/ProjectPageLayout.tsx`

```
┌ AppHeader ─────────────────────────────────────────────┐
│ DualSidebar │  scroll area: px-6 sm:px-12 py-10         │
│             │  space-y-10 between top-level blocks      │
│             │  ┌ PageHeader ─────────────────────────┐  │
│             │  │ Breadcrumbs                          │  │
│             │  │ Title [badge]              [actions] │  │
│             │  │ subtitle                             │  │
│             │  └──────────────────────────────────────┘  │
│             │  content …                                 │
└─────────────┴───────────────────────────────────────────┘
```

| Prop | Use |
| :--- | :--- |
| `activeSection` | Sidebar item to highlight: `overview`, `codex`, … |
| `loading` | First load only. Shows a spinner where the content goes. |
| `error` | A string or node shown in a red panel where the content goes. Takes priority over `loading`. |
| `onCreateEntry` | Shows the sidebar's "Create New Entry" button (codex index). |

Padding and spacing are fixed by the layout. Pages don't add their own outer padding.
The scroll area always keeps room for its scrollbar (`scrollbar-gutter: stable`), so a page that gets shorter or taller doesn't shift sideways. Any other scroll area you add needs the same.

---

## 3. Page header: `PageHeader` + breadcrumbs

`app/components/ui/PageHeader.tsx`, `app/components/ui/Breadcrumbs.tsx`, `app/config/breadcrumbs.ts`

- **Breadcrumbs** on every project page. They always take one line, so the title sits at the same height everywhere. Build the trail with `projectTrail(projectId, projectName, …crumbs)`. The last crumb is the current page and isn't a link.
  They replace the old "Back to …" links.
  | Page | Trail |
  | :--- | :--- |
  | Project dashboard | Projects › *Project* |
  | Codex | Projects › *Project* › Codex |
  | Entry | Projects › *Project* › Codex › *Entry* |
  | New entry | Projects › *Project* › Codex › New entry |
- **Title** (`h1`): the one page heading. Use the entry's name on the entry page (click it to rename) and "New Entry" when creating.
- **Badge**: a `chip` next to the title, e.g. the entry type (`EntryTypeBadge`). `PageHeader` nudges it down 2–3px so it is centred on the title's lowercase letters rather than its capitals, which is what reads as centred.
- **Subtitle**: one sentence of description, or an entry's aliases and tags. Don't put actions here.
- **Actions** (`children`): on the right on wide screens, under the title on narrow ones. On list pages this is the command bar (search, filters, create). On a single item it's the action buttons, primary first:
  - Entry page: the save status ("Saving… / ✓ Saved / Not saved"), then **Delete** (danger). There is no Edit button: the page is edited in place (§8).
  - New entry: **Create Entry** (primary), **Cancel** (secondary). `EntryForm` renders the header itself, because the submit button has to be inside the `<form>`.

---

## 4. Content layouts

**Single entry (entry page, new entry): two columns**, the same grid in both:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
  <aside className="order-2 lg:order-1 space-y-6">image, Details panel</aside>
  <div className="order-1 lg:order-2 space-y-8 min-w-0">main panels, EntryTabs</div>
</div>
```

On narrow screens the main column comes first. New entry adds a full-width "Type / Template" panel above the grid.

**Dashboard sections**: `glass-container p-6`, a `section-heading` with the primary dot on the left, and a small right-aligned label.

**Lists / grids**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` of cards.

---

## 5. Surfaces

| Class | What it is | Hover |
| :--- | :--- | :--- |
| `glass-panel rounded-2xl` | A panel of content the author reads or edits: the description, Details, the name/aliases/tags block. **Padding:** `p-5` in the sidebar, `p-6` (or `p-6 md:p-8`) in the main column. | Border turns primary, purple glow |
| `glass-container` | Structural frame that groups other panels (dashboard sections, dialogs, error box) | None |
| `child-panel` | Static tile inside a container (metric) | Slightly lighter |
| `child-panel-interactive` | Clickable tile inside a container (quick create) | Lift + primary border |
| `choice-tile` | Option in a picker; selection is marked with `aria-pressed` / `aria-checked` | Primary border; selected = tinted |
| Amber panel `bg-amber-500/5 border-amber-500/20 rounded-2xl p-6` | Private notes, nowhere else | None |
| Image box `aspect-[3/4] rounded-2xl bg-black/40 border border-white/10` | Entry image (dashed border when empty and editable) | — |

---

## 6. Type

| Role | Class |
| :--- | :--- |
| Page title | `PageHeader` (Outfit, `text-2xl sm:text-3xl`, bold, `text-glow`) |
| Panel / sidebar section heading | `section-heading` (12px, bold, uppercase, `tracking-[0.2em]`, white/60) |
| Form label | `field-label` (12px, semibold, uppercase, white/50) |
| Body text in a panel | `text-sm text-white/70 leading-relaxed` |
| Empty state ("No description yet.") | `text-sm text-white/40 italic` |
| Help under a field | `field-hint` |
| Validation error | `field-error` |
| Metadata (dates) | `text-xs text-white/40`, value `text-white/60` |

---

## 7. Controls

| Control | Class |
| :--- | :--- |
| Text input / textarea | `field-input` (add `text-lg font-semibold` for a name field, `text-sm` for long text). Mark errors with `aria-invalid`. |
| Tag / alias input | `TagInput` in forms (one `field-input` frame with `chip`s inside); `InlineChips` on the entry page |
| Primary button | `btn-pill btn-pill-primary` |
| Secondary / Cancel | `btn-pill btn-pill-secondary` |
| Destructive | `btn-pill btn-pill-danger` |
| Icon-only button | `text-white/35 hover:text-white`, with an `aria-label` |
| Tag / type pill | `chip` (add the type colour for type badges) |
| Tabs | `EntryTabs` |

Button labels are Title Case ("Create Entry", "Clear Filters"). Put icons in buttons inside `<span className="material-symbols-outlined" aria-hidden="true">`.

---

## 8. Editing in place

The entry page is edited where it is shown; there is no edit page (docs/codex-entry-model.md §2).

| Piece | Component | Behaviour |
| :--- | :--- | :--- |
| Text (name, description, notes, detail label or value) | `InlineText` | Click to edit. Enter saves a single line, Ctrl/Cmd+Enter saves long text, clicking away saves both, Esc cancels. A failed save reopens the field with the text. |
| Aliases, tags | `InlineChips` | × on a chip removes it, "+ Add" opens a small input. Every change saves at once. |
| Details | `DetailsInline` | Each label and value is an `InlineText`. Reorder and remove buttons appear on hover. Empty template details stay visible with their hint. |
| Image | `EntrySidebar` with `onImageChange` | Hover for Change / Remove; click the empty box to upload. |
| Saving | `useEntryAutosave` | One save at a time, each with the version the previous one returned. |

Rules:
- **Opening an editor moves nothing.** The editor takes exactly the box of the text it replaces: same type, padding and border. Show the frame with a background, border colour or box-shadow, never by adding space, and put help text in a `title` rather than a line underneath. The name in the title has no padding at all; its frame is a box-shadow drawn outside the text.
- Empty fields show what to add ("Add a description…", or the detail's hint) in `text-white/35 italic`, never a blank gap.
- Anything destructive (removing a detail that has text, removing the image) asks first.

---

## 9. Not migrated yet

- The projects hub (`app/(projects)/page.tsx`) sits outside a project. It has the same padding and `PageHeader`, but no sidebar or breadcrumbs.
- `EntryCard`, `EntryFilters`, `CommandBar`, `ProjectCard` and the auth pages still use some raw colours and their own button styles. Move them to §5–§7 when you next touch them.
- `btn-cosmic`, `btn-primary`, `btn-glass`, `glass`, `glass-card` are older button and surface styles. Don't use them in new code. Remove them once nothing uses them.
