# Mytherion Frontend

Mytherion is a worldbuilding (and later, writing) platform built for creators who want to come away from the classic boxes. It gives writers and worldbuilders creative freedom over structure, AI support that works the way coding tools do, and the infrastructure to own their creative work as real, versioned, navigable data.

This repository contains the Next.js + React + TypeScript frontend with Redux state management, modern UI design, and project management features.

---

## What is Mytherion?

A lot of writing apps — Scrivener, NovelCrafter, and the rest — share the same flaw: they give you a pre-defined structure and expect your story to fit inside it. When AI gets bolted on, it fires a complex prompt in the background and hopes it picks up the relevant context as you go.

I don't believe in forcing creativity into boxes. And I don't think AI for writing should work any differently to AI for code.

### Three core pillars

#### 1. Creative freedom over structure

Mytherion ships with a default structure — a Codex with entity types like Character, Location, Organization, Culture, Species, and Item, and some pre-defined project genres. These are starting points, not hard requirements.

The goal down the line is to be able to customise everything: custom categories, custom tags, custom metadata fields. If your world has Factions, Deities, Starships, or Arcane Schools, you should be able to define those as first-class entities. The platform should fit the project — not the other way around.

#### 2. AI support that works the way coding tools do

Writing a novel _is_ engineering in its form. An author building a world, defining characters, structuring arcs, plotting narrative threads — it's the same interconnected, multi-file project as a complex codebase.

Coding AI agents handle context differently than their web chat counterparts do. They _go find what's relevant to your current prompt_, on the fly. Ask it to summarise all chapters? It'll pull the chapter files. Ask it to revise a single paragraph? It pulls that section and the context. It dynamically scopes what it needs. That makes a huge difference when you're working on a 50k+ word project across dozens if not hundreds of files.

That's the model Mytherion brings to writing — tools like Claude Code, Cursor, Codex, Gemini CLI. Instead of forcing you to craft elaborate prompts and cross your fingers, the AI should navigate the Codex, read entity definitions, trace relationship threads, and apply it exactly where it matters.

#### 3. Your world is your data — and you should own it

A manuscript, a Codex, a set of interlocking narrative threads — all of it is data. Structured, relational, versioned data. A software project treats version history, diff views, structural navigation, and multi-file continuity as _baseline infrastructure_. A creative project should have exactly the same.

The assumption that writers don't want this, or can't handle it, is wrong. It's not a complexity problem — it's a representation problem, and a matter of trust. Writers already mentally track who said what in Chapter 3, what a character's backstory was in the first draft, whether that subplot ever got resolved. Version history and structural visibility aren't alien concepts. The tooling just hasn't caught up.

Mytherion wants to build that infrastructure: a platform where your creative project is as navigable, recoverable, and structurally visible as a well-maintained codebase. Where no draft is ever truly lost. Writers deserve that level of trust in their tools.

---

## Tech Stack

- **Next.js 16.1.1**
- **React 19.2.3**
- **TypeScript 5**
- **Redux Toolkit 2.11.2**
- **Axios 1.13.2**
- **Tailwind CSS 4**
- **FontAwesome**
- **Jest 30.2.0**
- **React Testing Library**

---

## Project Status

**MVP**

- User registration, login, and email verification
- Project management UI with full CRUD operations
- Project dashboard with statistics
- Redux-based state management
- Responsive design with modern aesthetics
- Session persistence
- Email verification flow
- Entity management (Codex) UI

---

## Prerequisites

- **Node.js 20+**
- **npm** or **yarn**
- **Backend API** running on `http://localhost:8080`

---
## What I Learned

### Redux Toolkit over local component state only
I used Redux Toolkit because auth/session state and project data are shared across multiple screens and actions. It gave me a predictable way to handle loading/error/success states and made flows easier.

**Tradeoff:** Redux adds boilerplate that's sometimes heavy for a smaller app like this. For a simpler project, local state + context could be enough.

### Axios for API calls
I used Axios mainly for a clean API layer and interceptors (especially for auth/session handling and consistent error handling).

**Tradeoff:** `fetch` could've been enough. Axios is another dependency to maintain, so the benefit's mostly in consistency and ergonomics.

### Entity management scope limited in MVP
I intentionally focused on auth + project CRUD first before building the full entity management UI. I wanted to stabilize the main app flow before expanding feature breadth.

**Tradeoff:** the README roadmap grew faster than the implemented UI in some areas, which is something I want to keep tighter going forward.

### What I’d improve next
- Generate a typed API client from backend contracts (or shared types)
- Improve error handling UX (clearer field-level messages and retry states)
- Add more integration tests around auth/session restore flows
- Tighten loading states and optimistic update behavior
- Keep README/API status more strictly aligned with what is actually implemented

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/r-meunier/mytherion-frontend.git
cd mytherion-frontend
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Adjust the API URL if your backend runs on a different port.

---

### 4. Run the development server

```bash
npm run dev
```

The application will be available at:

- **Local:** `http://localhost:3000` (or `3001` if 3000 is in use)
- **Network:** `http://<your-ip>:3000`

---

### 5. Check it's running

Navigate to `http://localhost:3000` in your browser.

---

## Available Scripts

### Development

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for prod
npm run start        # Start prod server
npm run lint         # Run ESLint
```

### Testing

```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## Project Structure

```
mytherion-frontend/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── DualSidebar.tsx
│   │   ├── VerificationBanner.tsx
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── entities/         # Entity management components
│   │   └── projects/         # Project management components
│   │       ├── ProjectCard.tsx
│   │       ├── ProjectList.tsx
│   │       ├── ProjectForm.tsx
│   │       ├── ProjectStats.tsx
│   │       ├── ProjectModal.tsx
│   │       ├── ProjectSkeleton.tsx
│   │       └── EmptyProjectState.tsx
│   ├── services/             # API service layer
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   └── api.ts
│   ├── store/                # Redux store and slices
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── projectSlice.ts
│   │   └── hooks.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── auth.ts
│   │   └── project.ts
│   ├── utils/                # Utility functions
│   │   ├── formatDate.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── login/                # Login page
│   │   └── page.tsx
│   ├── register/             # Register page
│   │   └── page.tsx
│   ├── verify-email/         # Email verification page
│   │   └── page.tsx
│   ├── projects/             # Projects section
│   │   ├── page.tsx          # Project list
│   │   └── [projectId]/      # Dynamic project routes
│   │       ├── page.tsx      # Project dashboard
│   │       ├── settings/     # Project settings
│   │       ├── entities/     # Entity management
│   │       └── analytics/    # Analytics (planned)
│   ├── layout.tsx            # Root layout with Redux Provider
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles and design system
├── public/                   # Static assets
├── .env.local                # Environment variables (create this)
├── jest.config.ts            # Jest configuration
├── jest.setup.ts             # Jest setup
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json
```

---

## Features

### Authentication

- **User Registration**
  - Email, username, and password validation
  - Client-side form validation
  - Duplicate email/username detection
  - Secure password requirements (min 8 characters)
  - Password strength indicator
  - Real-time validation feedback

- **User Login**
  - Email and password authentication
  - Session persistence via httpOnly cookies
  - Automatic session restoration on page refresh
  - Remember me functionality
  - Error handling with user-friendly messages

- **Email Verification**
  - Token-based email verification
  - Verification banner for unverified users
  - Resend verification email option
  - Success/error feedback
  - Automatic redirect after verification

- **Session Management**
  - Redux-based authentication state
  - Persistent sessions across tabs
  - Secure logout with cookie clearing
  - Automatic session refresh
  - Protected route handling

### Project Management

- **Project List Page** (`/projects`)
  - Grid view with responsive layout (1-3 columns)
  - Project cards with gradient backgrounds
  - Hover effects and animations
  - Create new project modal
  - Loading skeletons for better UX
  - Empty state with call-to-action
  - Pagination support

- **Project Dashboard** (`/projects/[projectId]`)
  - Project overview and statistics
  - Entity count breakdown by type
  - Quick actions (edit, delete, settings)
  - Navigation to entity management
  - Breadcrumb navigation
  - Responsive layout

- **Project CRUD Operations**
  - Create projects with name and description
  - Edit project details
  - Delete projects (soft delete)
  - Form validation
  - Error handling
  - Success notifications

- **Project Statistics**
  - Total entity count
  - Breakdown by entity type (Character, Location, etc.)
  - Visual icons for each type
  - Real-time updates

### UI/UX

- **Modern Design System**
  - Purple/blue gradient theme
  - Glassmorphism effects
  - Animated backgrounds
  - Backdrop blur effects
  - Smooth transitions
  - Micro-animations on hover

- **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interactions
  - Adaptive layouts
  - Breakpoint-based grid system

- **Component Library**
  - Reusable UI components
  - Consistent styling
  - Accessible design
  - Loading states
  - Error states
  - Empty states

- **Navigation**
  - Dynamic navbar with auth state
  - Dual sidebar layout (left: navigation, right: actions)
  - User profile display
  - Quick access to settings and logout
  - Breadcrumb navigation
  - Mobile-friendly menu

### State Management

- **Redux Toolkit**
  - Centralized auth state
  - Centralized project state
  - Async thunks for API calls
  - Type-safe hooks (`useAppDispatch`, `useAppSelector`)
  - Error handling
  - Loading states
  - Optimistic updates

- **State Slices**
  - `authSlice` – User authentication and session
  - `projectSlice` – Project management
  - `entitySlice` – Entity (Codex) management

### Security

- **httpOnly Cookies**
  - JWT stored in secure cookies
  - XSS protection
  - CSRF protection (SameSite=Strict)
  - Automatic cookie handling

- **Form Validation**
  - Client-side validation
  - Server-side validation
  - Error message display
  - Real-time feedback
  - Password strength checking

### Developer Experience

- **TypeScript**
  - Full type safety
  - Autocomplete support
  - Compile-time error checking
  - Interface definitions for all data

- **Code Quality**
  - ESLint configuration
  - Consistent code style
  - Component organization
  - Separation of concerns

- **Performance**
  - Next.js Turbopack for fast development
  - Automatic code splitting
  - Image optimization
  - CSS optimization
  - Server-side rendering where appropriate

---

## API Integration

The frontend communicates with the backend REST API.

### Authentication Service

| Endpoint                  | Method | Description              |
| ------------------------- | ------ | ------------------------ |
| `/api/auth/register`      | POST   | Register new user        |
| `/api/auth/login`         | POST   | Login user               |
| `/api/auth/logout`        | POST   | Logout user              |
| `/api/auth/me`            | GET    | Get current user         |
| `/api/auth/verify-email`  | GET    | Verify email via token   |
| `/api/auth/resend-verify` | POST   | Resend verification link |

### Project Service

| Endpoint                   | Method | Description          |
| -------------------------- | ------ | -------------------- |
| `/api/projects`            | GET    | List user's projects |
| `/api/projects`            | POST   | Create new project   |
| `/api/projects/{id}`       | GET    | Get project details  |
| `/api/projects/{id}`       | PUT    | Update project       |
| `/api/projects/{id}`       | DELETE | Delete project       |
| `/api/projects/{id}/stats` | GET    | Get project stats    |

### API Configuration

The API URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

All API requests include `credentials: 'include'` to handle cookies automatically.

---

## Redux State Management

### Auth Slice

The authentication state is managed by `authSlice.ts`:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Async Thunks:**

- `registerUser` – Register new user
- `loginUser` – Login user
- `logoutUser` – Logout user
- `checkAuth` – Validate session on page load
- `verifyEmail` – Verify email with token
- `resendVerification` – Resend verification email

### Project Slice

The project state is managed by `projectSlice.ts`:

```typescript
interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}
```

**Async Thunks:**

- `fetchProjects` – Get all user projects
- `fetchProject` – Get single project
- `createProject` – Create new project
- `updateProject` – Update existing project
- `deleteProject` – Delete project
- `fetchProjectStats` – Get project statistics

### Usage Example

```typescript
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { loginUser } from "./store/authSlice";
import { fetchProjects } from "./store/projectSlice";

const { user, isAuthenticated, isLoading, error } = useAppSelector(
  (state) => state.auth,
);
const { projects } = useAppSelector((state) => state.project);
const dispatch = useAppDispatch();

// Login
await dispatch(loginUser({ email, password }));

// Fetch projects
await dispatch(fetchProjects());
```

---

## Design System

### Color Palette

- **Primary Gradient:** Purple to Blue (`from-purple-600 to-blue-600`)
- **Background:** Dark theme with gradient overlays
- **Glassmorphism:** `backdrop-blur-md` with semi-transparent backgrounds
- **Accents:** Purple, blue, and gradient variants

### Typography

- **Font Family:** System fonts with fallbacks
- **Headings:** Bold, gradient text effects
- **Body:** Clean, readable text with proper contrast

### Components

- **Cards:** Rounded corners, shadow effects, hover animations
- **Buttons:** Gradient backgrounds, hover states, disabled states
- **Forms:** Floating labels, validation feedback, error states
- **Modals:** Centered, backdrop blur, smooth animations

### Animations

- **Hover Effects:** Scale, shadow, and color transitions
- **Loading States:** Skeleton screens, spinners
- **Page Transitions:** Smooth fade-in effects
- **Micro-interactions:** Button clicks, form submissions

---

## Testing

### Unit Tests

Tests are using Jest and React Testing Library.

```bash
npm test
```

### Test Coverage

- Redux auth slice
- Redux project slice
- Component rendering tests (planned)
- Integration tests (planned)

---

## Further Planned Features

### Short-term

- **Entity Management enhancements**
  - Advanced filtering and search
  - Tag management UI
  - Type-specific metadata forms

### Medium-term

- **Custom Codex structure**
  - User-defined entity categories (beyond the 6 defaults)
  - Custom metadata field editor per entity type
  - Custom tag taxonomies
  - Genre and project type customisation

- **Image Upload**
  - Drag-and-drop upload
  - Image preview
  - Image management
  - Fallback images

- **Relationship Mapping**
  - Visual graph of entity connections
  - Relationship types (ally, rival, origin, etc.)
  - Filterable by entity type

### Long-term

- **Polish & UX**
  - Toast notifications
  - Confirmation dialogs
  - Keyboard shortcuts
  - Accessibility improvements
  - Performance optimization

- **AI Layer**
  - AI assistant that navigates the Codex like a codebase — dynamically scoping what's relevant to your current request rather than loading everything at once
  - Ask it to summarise all chapters → it pulls the chapter files; ask it to revise a paragraph → it pulls that section and the surrounding context
  - Targeted edits to individual entities, scenes, or passages without touching unrelated content
  - Context-aware suggestions backed by your own world's lore (not generic fiction tropes)
  - Works _with_ version history — understands what changed, when, and why

- **Version history and structural infrastructure**
  - Every entity, chapter, and narrative thread treated as versioned, diffable, structurally navigable content
  - The same baseline infrastructure a software project takes for granted: history, recovery, visibility, and coherence across the whole project graph
  - No draft is ever truly lost

- **Collaboration & Export**
  - Collaborative editing
  - Export to PDF, Markdown, or Docx
  - Mobile app (React Native)
  - Version history for entities and narrative content

---

## Architecture Decisions

### App Router (Next.js 13+)

- Server components by default
- Client components marked with `'use client'`
- File-based routing
- Nested layouts
- Loading and error boundaries

### State Management Strategy

- **Redux for global state:**
  - Authentication
  - Projects
  - Entities

- **Local state for component state:**
  - Form inputs
  - UI toggles
  - Temporary data

### API Service Layer

- Centralized API calls in service files
- Axios for HTTP requests
- Automatic cookie handling
- Error handling and transformation
- Type-safe request/response

### Component Organization

- **Shared components** in `app/components/`
- **Feature-specific components** in subdirectories
- **Pages** in route directories
- **Reusable logic** in `utils/`

---

## Development Notes

### Code Style

- TypeScript
- Functional components
- Tailwind CSS
- ESLint
- Consistent naming conventions

### Best Practices

- Small, focused components
- Use Redux for global state
- Prefer server components
- Validate on both client and server
- Handle loading and error states
- Ensure accessibility

### Performance Optimization

- Next.js Turbopack
- Automatic code splitting
- Image optimization
- CSS optimization
- Lazy loading
- Memoization

---

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

---

## Troubleshooting

### Different Port

To specify a different port:

```bash
PORT=3002 npm run dev
```

### API Connection

Ensure the backend is running on `http://localhost:8080`:

```bash
curl http://localhost:8080/api/health
```

### CORS

The backend must allow `http://localhost:3000` and `http://localhost:3001` in CORS configuration.

Check backend `application.yml`:

```yaml
cors:
  allowed-origins:
    - http://localhost:3000
    - http://localhost:3001
```

### Build

Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

### TypeScript

Restart TypeScript server in your IDE or run:

```bash
npx tsc --noEmit
```

---

## Contributing

This is a personal project for now.

---

## Related Repositories

- **Backend:** [mytherion-backend](https://github.com/r-meunier/mytherion-backend)

---

## License

This project is currently not licensed for redistribution.

---

## Support

For issues or questions, please open an issue on GitHub.
