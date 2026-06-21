# Frontend Implementation Plan - Entity Management

## Overview

Complete frontend implementation for the Mytherion entity management system, building on top of the completed backend (Phases 1-7).

---

## Phase 3: Projects UI ✅ **COMPLETE**

### Goal

Project management interface with CRUD operations, stats display, and beautiful UI.

### Completed Features

**Redux State Management:**

- ✅ `projectSlice.ts` - Full CRUD with async thunks
- ✅ `projectService.ts` - API integration with axios
- ✅ Store configuration updated

**Components:**

- ✅ `ProjectCard.tsx` - Gradient cards with hover effects
- ✅ `ProjectList.tsx` - Grid with loading skeleton, empty state, pagination
- ✅ `ProjectForm.tsx` - Create/edit with validation
- ✅ `ProjectStats.tsx` - Entity breakdown with icons

**Pages:**

- ✅ `/projects` - List page with create modal, navbar, sidebar
- ✅ `/projects/[projectId]` - Dashboard with stats, navbar, sidebar

**Styling:**

- ✅ Purple/blue gradient theme matching home page
- ✅ Animated background with backdrop blur
- ✅ Loading skeletons for better UX
- ✅ Empty state with CTA
- ✅ Responsive grid (1-3 columns)

**Integration:**

- ✅ Authentication check on mount
- ✅ Navbar shows correct user state
- ✅ Backend API integration ready

---

## Phase 4: Entities (Basic CRUD) - **NEXT**

### Goal

Entity list and basic CRUD without type-specific metadata fields.

### Components to Create

**Entity Components:**

```
components/entities/
├── EntityCard.tsx          - Card view for entities
├── EntityDataView.tsx      - Table/data view
├── EntityList.tsx          - List with filters
├── EntityForm.tsx          - Create/edit form (basic)
├── EntityTypeSelector.tsx  - Type picker
├── TagInput.tsx            - Tag management
└── SearchBar.tsx           - Search component
```

**Pages:**

```
app/projects/[projectId]/entities/
├── page.tsx                - Entity list
├── [entityId]/
│   ├── page.tsx           - Entity detail
│   └── edit/
│       └── page.tsx       - Edit form
└── new/
    └── page.tsx           - Create form
```

### Redux Setup

**Entity Slice:**

```typescript
interface EntityState {
  entities: Entity[];
  currentEntity: Entity | null;
  loading: boolean;
  error: string | null;
  filters: {
    type: EntityType | null;
    tags: string[];
    search: string;
  };
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
  };
}
```

**Actions:**

- `fetchEntities` - Get paginated list with filters
- `fetchEntity` - Get single entity
- `createEntity` - Create new entity
- `updateEntity` - Update existing
- `deleteEntity` - Soft delete
- `setFilters` - Update filter state

### API Service

**entityService.ts:**

```typescript
-getEntities(projectId, filters, page, size) -
  getEntity(id) -
  createEntity(projectId, data) -
  updateEntity(id, data) -
  deleteEntity(id);
```

### Implementation Order

1. **Redux Setup** (1-2 hours)
   - Create `entitySlice.ts`
   - Create `entityService.ts`
   - Add to store configuration

2. **Basic Components** (2-3 hours)
   - EntityCard
   - EntityList with filters
   - SearchBar
   - TagInput

3. **Entity List Page** (1-2 hours)
   - `/projects/[projectId]/entities`
   - Integrate EntityList
   - Add filters sidebar
   - Add "Create Entity" button

4. **Entity Form** (2-3 hours)
   - EntityForm component
   - EntityTypeSelector
   - Basic fields only (no metadata yet)
   - Validation

5. **Create/Edit Pages** (1-2 hours)
   - New entity page
   - Edit entity page
   - Form integration

6. **Entity Detail Page** (1-2 hours)
   - Display entity information
   - Edit/delete buttons
   - Breadcrumb navigation

**Estimated Time:** 8-14 hours

---

## Phase 5: Entity Types (Metadata)

### Goal

Add type-specific metadata fields for each entity type.

### Components to Create

**Metadata Components:**

```
components/entities/metadata/
├── CharacterFields.tsx     - Age, role, personality
├── LocationFields.tsx      - Region, climate, population
├── OrganizationFields.tsx  - Type, leader, founded
├── SpeciesFields.tsx       - Lifespan, traits, habitat
├── CultureFields.tsx       - Language, traditions, values
└── ItemFields.tsx          - Origin, purpose, rarity
```

### Implementation

1. **Create Metadata Components** (3-4 hours)
   - One component per entity type
   - Dynamic form fields based on type
   - Validation for each field type

2. **Integrate into EntityForm** (1-2 hours)
   - Show/hide based on selected type
   - Serialize/deserialize JSONB metadata
   - Update validation

3. **Display in Detail View** (1 hour)
   - Render type-specific fields
   - Format metadata nicely

**Estimated Time:** 5-7 hours

---

## Phase 6: Image Upload

### Goal

Image upload UI with drag-and-drop support.

### Components to Create

**Image Components:**

```
components/entities/
├── ImageUpload.tsx         - Upload with drag-drop
└── ImagePreview.tsx        - Display with delete option
```

### Implementation

1. **ImageUpload Component** (2-3 hours)
   - Drag-and-drop zone
   - File validation (type, size)
   - Preview before upload
   - Progress indicator

2. **Integration** (1-2 hours)
   - Add to entity form
   - Add to entity detail page
   - Handle upload/delete

3. **Display** (1 hour)
   - Show in EntityCard
   - Show in detail view
   - Fallback for no image

**Estimated Time:** 4-6 hours

---

## Phase 7: Polish & UX

### Goal

Smooth user experience with error handling, loading states, and animations.

### Tasks

1. **Loading States** (1-2 hours)
   - Skeletons for all lists
   - Spinners for actions
   - Disable buttons during loading

2. **Error Handling** (2-3 hours)
   - Toast notifications
   - Error boundaries
   - Retry mechanisms
   - User-friendly messages

3. **Empty States** (1 hour)
   - No projects
   - No entities
   - No search results
   - Helpful CTAs

4. **Confirmation Dialogs** (1-2 hours)
   - Delete confirmations
   - Unsaved changes warnings
   - Reusable dialog component

5. **Performance** (2-3 hours)
   - Lazy loading
   - Pagination optimization
   - Image optimization
   - Code splitting

6. **Responsive Design** (2-3 hours)
   - Mobile layouts
   - Tablet layouts
   - Touch interactions

7. **Keyboard Shortcuts** (1-2 hours)
   - Create (Ctrl+N)
   - Search (Ctrl+K)
   - Navigation (arrows)

**Estimated Time:** 10-16 hours

---

## Total Estimated Time

- **Phase 3:** ✅ Complete (12 hours actual)
- **Phase 4:** 8-14 hours
- **Phase 5:** 5-7 hours
- **Phase 6:** 4-6 hours
- **Phase 7:** 10-16 hours

**Total Remaining:** 27-43 hours (3-5 days of work)

---

## Testing Strategy

### Component Tests

- ProjectCard, EntityCard rendering
- Form validation
- Filter functionality

### Integration Tests

- Create entity flow
- Edit entity flow
- Delete entity flow
- Search and filter

### E2E Tests

- Full user journey
- Project → Entity creation
- Image upload
- Navigation

---

## Notes

- Backend API is complete and tested
- All 6 entity types supported
- Soft delete implemented
- Image storage via MinIO
- PostgreSQL arrays for tags
- JSONB for metadata

---

## Current Status

**Completed:** Phase 3 - Projects UI  
**Next:** Phase 4 - Entities (Basic CRUD)  
**Location:** `/projects` page is live and functional  
**Backend:** Running on port 8080  
**Frontend:** Running on port 3001
