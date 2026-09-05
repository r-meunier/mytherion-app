# Entry Section Coupling & Architecture Plan

> Vocabulary follows [`terminology.md`](./terminology.md). What this document previously called an
> "entity component" is now an **entry section** (`EntrySection` / `SectionType`), renamed in MYT-81
> because `Component` collided with React's core noun and `Entity` collided with JPA's `@Entity`.

## 1. Goal: Stronger Coupling
To ensure the frontend and backend stay in sync regarding entry sections, we are implementing the following patterns:

### A. Shared Type Registry
The section discriminator exists in both codebases — as `@JsonSubTypes` name strings in Kotlin, and as a formal `SectionType` enum in TypeScript.
- **Best Practice**: The backend is the source of truth. If the backend defines a new section in its `@JsonSubTypes` list, the frontend's `SectionType` enum must be updated to match.
- **Invariant**: `EntryType` and `SectionType` must share **no** value names. `EntryType.LOCATION` means "this entry *is* a location"; `SectionType.LOCATION_DETAILS` means "this entry *has* location data". Type-specific blocks therefore carry a `_DETAILS` suffix.

### B. Formal Identification (IDs)
`EntrySection` carries an `id` field.
- **Why?**: In the future, we might want to support multiple sections of the same type (e.g., two "Custom" blocks). A unique `id` allows the frontend to track these instances correctly in lists without relying on the `type` index.
- **Implementation**: In the backend, `id` defaults to `type` in the base interface. In the frontend, we add a required `id` field to the `EntrySection` union.

## 2. Workflow for Adding a New Section
To add a section "X":

1. **Backend Model**:
    - Create `XSection.kt` and `XData` class in `codex/model/sections/`.
    - Add `XSection::class` to `@JsonSubTypes` in `EntrySection.kt`.
    - If X is specific to one entry type, name the discriminator `X_DETAILS` so it cannot collide with `EntryType`.
2. **Frontend Types**:
    - Add `X` to the `SectionType` enum in `types/codex.ts`.
    - Add `XData` interface.
    - Add `| { id: string; type: SectionType.X; data: XData }` to the `EntrySection` union.
3. **Frontend UI**:
    - Create `XFields.tsx` in `components/codex/sections/`.
    - Add case `SectionType.X` to `SectionDispatcher.tsx`.
    - Add `X` to relevant archetype in `TAB_CONFIG` (in `EntrySectionsEditor.tsx`).

> Any change here must keep backend and frontend in step. Both suites can pass while the two sides
> disagree — during MYT-81 exactly that happened, and only a cross-boundary parity check caught it.

## 3. Future Improvements: Meta-Data Driven UI
To avoid manual updates in step 3, we could implement a system where:
- The backend provides a `/api/entries/sections/schema` endpoint.
- The frontend uses this schema to dynamically generate forms (e.g., using a JSON Schema form builder).
- This would allow adding sections purely by changing the backend.

## 4. Current Progress
- [x] Introduced the section type enum in Frontend.
- [x] Added `id` property to the section base type in Backend (defaulting to `type`).
- [x] Added `ORIGINS` section to Frontend (matching Backend).
- [x] Add `id` property to the section union in Frontend.
- [x] Update `EntryForm.tsx` to generate/provide `id` for sections.
- [x] Update `SectionDispatcher.tsx` to handle `ORIGINS` and other missing types.
- [x] Renamed component → section and removed the `EntryType`/`SectionType` name collision (MYT-81).
