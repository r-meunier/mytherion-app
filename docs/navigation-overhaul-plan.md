# Implementation Plan: Project-Centric Navigation Overhaul

## 1. Vision & Objective
Transition Mytherion from a "Global Entry" app to a "World Selection" app. Like NovelCrafter or LoreForge, the user should select a **Project (World/Book)** as their primary context. Once selected, all navigation (Characters, Locations, Timeline) should be scoped to that specific project.

## 2. Structural Changes

### 2.1. URL Hierarchy
Standardize the URL structure to reflect the project context:
- `/projects`: **The Hub**. List of all user projects.
- `/projects/new`: Create a new world.
- `/projects/[id]`: **Project Dashboard**. Overview of a specific world.
- `/projects/[id]/codex`: The codex entry browser (Characters, etc.) for that world.
- `/projects/[id]/timeline`: Chronological map for that world.
- `/projects/[id]/settings`: World-specific configurations.

### 2.2. Global vs. Project State
Introduce a `projectContext` in the Redux store:
- `currentProjectId`: The ID of the currently active world.
- `globalDashboard`: A separate view for cross-project metrics (optional).

## 3. Backend Architectural Changes

### 3.1. API Restructuring
Transition from global endpoints to project-scoped endpoints:
- **Current**: `GET /api/entries`
- **Future**: `GET /api/projects/{projectId}/entries`
- **Current**: `POST /api/entries`
- **Future**: `POST /api/projects/{projectId}/entries` (Automatically associates the entry with the project)

### 3.2. Project-Scoped Security (Tenant Isolation)
Implement a security layer to enforce data isolation:
- **Project Access Interceptor**: A Spring Boot Interceptor/Filter that extracts `projectId` from the URL and verifies that the authenticated user owns or has access to that project.
- **Resource Ownership**: Ensure that no resource (Codex Entry, Note, Timeline) can be accessed or modified if it doesn't belong to the `projectId` provided in the path.

### 3.3. Service & Repository Layer Updates
- **Filtering**: All service methods (e.g., `findAllByProject`) must now pass a mandatory `projectId`.
- **Validation**: When creating sub-resources (like a character relation), verify that both entries belong to the same project context.

### 3.4. Database Optimization
- Ensure `projectId` is indexed on all entry-related tables to maintain high performance as the number of projects grows.

## 4. Component Updates

### 4.1. DualSidebar Scope Switching
Refactor `DualSidebar.tsx` to handle two distinct modes:
- **Global Mode**:
  - Main Icon: Home/Dashboard.
  - Sub-items: Projects List, User Profile, Global Settings.
- **Project Mode**:
  - Main Icon: Project Logo/Icon.
  - Sub-items: Codex, Timeline, Relations, Map, Notes.
  - *Context Switcher*: A way to quickly jump back to the Project List.

### 4.2. Project Dashboard (`app/projects/[id]/page.tsx`)
- Enhance the current project page to become the "Home" for that world.
- Add "Quick Create" buttons that automatically associate new entries with the current `projectId`.
- Show "Recent Edits" *within this world*.

### 4.3. Navigation Hub (`app/page.tsx`)
- Redirect from `/` to `/projects` if the user is logged in and no "Active Project" is detected.
- Or, show a "Welcome Back" screen that highlights the last edited project and a "Jump Back In" button.

## 5. API & Data Layer (Frontend)
- **Filter by Project**: Ensure all entry fetching hooks (e.g., `useEntries`) accept a `projectId` parameter and use the new scoped URL format.
- **Auto-Association**: Update the `EntryForm` to automatically include the `projectId` from the current URL context when creating new items.

## 6. Phased Rollout
1. **Phase 1: Backend API Refactor**. Update the REST controllers to support `{projectId}` path variables and enforce security.
2. **Phase 2: URL Refactoring (Frontend)**. Move existing global entry views under the `/projects/[id]` route.
3. **Phase 3: Contextual Sidebar**. Update the sidebar to dynamically change its menu based on whether a project is "Active".
4. **Phase 4: Dashboard Redesign**. Turn the main landing page into a Project Selection Hub.
5. **Phase 5: Deep Linking & Storage**. Ensure that navigating directly to `/projects/5/codex` correctly sets the app context and stores the last-active project in local storage.

## 7. Open Questions / Design Decisions
- Should we allow "Global Search" across all projects?
- Do we need a "Global Codex" that shows everything regardless of project? (Likely no, to keep focus.)
- How do we handle "Shared Entries" (e.g., a recurring character in a series)?

> Vocabulary note: written before [`terminology.md`](./terminology.md). "World" here means **Project**.
