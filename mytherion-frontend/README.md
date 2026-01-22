# Mytherion Frontend

Mytherion is a lightweight worldbuilding and codex-style application for organizing creative projects. This repository contains the **Next.js + React + TypeScript frontend** with Redux state management, modern UI design, and comprehensive project management features.

---

## Tech Stack

- **Next.js 16.1.1** (App Router)
- **React 19.2.3**
- **TypeScript 5**
- **Redux Toolkit 2.11.2** – State management
- **Axios 1.13.2** – API client
- **Tailwind CSS 4** – Styling
- **FontAwesome** – Icons
- **Jest 30.2.0** – Testing framework
- **React Testing Library** – Component testing

---

## Project Status

✅ **Production-Ready MVP**

- User registration, login, and email verification
- Project management UI with full CRUD operations
- Project dashboard with statistics
- Redux-based state management
- Responsive design with modern aesthetics
- Session persistence
- Email verification flow
- Ready for entity management features

---

## Prerequisites

You need the following installed:

- **Node.js 20+**
- **npm** or **yarn**
- **Backend API** running on `http://localhost:8080`

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Adelaice7/mytherion-frontend.git
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

### 5. Verify it's running

Navigate to `http://localhost:3000` in your browser.

You should see the Mytherion home page with a login button.

---

## Available Scripts

### Development

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
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
│   │       ├── entities/     # Entity management (planned)
│   │       └── analytics/    # Analytics (planned)
│   ├── layout.tsx            # Root layout with Redux Provider
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles and design system
├── public/                   # Static assets
├── docs/                     # Documentation
│   ├── IMPLEMENTATION_PLAN.md
│   └── PHASE_3_TASKS.md
├── .env.local                # Environment variables (create this)
├── jest.config.ts            # Jest configuration
├── jest.setup.ts             # Jest setup
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json
```

---

## Current Features

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
  - (Planned) `entitySlice` – Entity management

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

The frontend communicates with the backend API via service layers.

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

Tests are written using Jest and React Testing Library.

```bash
npm test
```

### Test Coverage

- Redux auth slice (20+ tests)
- Redux project slice
- Component rendering tests (planned)
- Integration tests (planned)

### Testing Best Practices

- Test user interactions, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Mock API calls
- Test loading and error states

---

## Planned Features

### Short-term (Phase 4)

- **Entity Management UI**
  - Entity list with filters
  - Entity CRUD operations
  - Search functionality
  - Tag management
  - Type-specific forms

### Medium-term (Phase 5-6)

- **Entity Types with Metadata**
  - Character fields (age, role, personality)
  - Location fields (region, climate, population)
  - Organization fields (type, leader, founded)
  - Species fields (lifespan, traits, habitat)
  - Culture fields (language, traditions, values)
  - Item fields (origin, purpose, rarity)

- **Image Upload**
  - Drag-and-drop upload
  - Image preview
  - Image management
  - Fallback images

### Long-term (Phase 7+)

- **Polish & UX**
  - Toast notifications
  - Confirmation dialogs
  - Keyboard shortcuts
  - Accessibility improvements
  - Performance optimization

- **Advanced Features**
  - Relationship mapping visualization
  - Export functionality (PDF, images)
  - AI-assisted content generation
  - Collaborative editing
  - Mobile app (React Native)
  - Advanced search and filtering
  - Version history

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
  - Entities (planned)

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

- **TypeScript** for type safety
- **Functional components** with hooks
- **Tailwind CSS** for styling
- **ESLint** for code quality
- **Consistent naming** conventions

### Best Practices

- Keep components small and focused
- Use Redux for global state only
- Prefer server components when possible
- Validate on both client and server
- Handle loading and error states
- Use semantic HTML
- Ensure accessibility

### Performance Optimization

- Next.js Turbopack for fast development
- Automatic code splitting
- Image optimization with Next.js Image
- CSS optimization
- Lazy loading for heavy components
- Memoization where appropriate

---

## Environment Variables

| Variable              | Description     | Default                 |
| --------------------- | --------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Next.js will automatically use port 3001.

To specify a different port:

```bash
PORT=3002 npm run dev
```

### API Connection Issues

Ensure the backend is running on `http://localhost:8080`:

```bash
curl http://localhost:8080/api/health
```

### CORS Errors

The backend must allow `http://localhost:3000` and `http://localhost:3001` in CORS configuration.

Check backend `application.yml`:

```yaml
cors:
  allowed-origins:
    - http://localhost:3000
    - http://localhost:3001
```

### Build Errors

Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

### TypeScript Errors

Restart TypeScript server in your IDE or run:

```bash
npx tsc --noEmit
```

---

## Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## Related Repositories

- **Backend:** [mytherion-backend](https://github.com/Adelaice7/mytherion-backend)

---

## License

This project is currently not licensed for redistribution.

---

## Documentation

Additional documentation:

- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Phase 3 Tasks](docs/PHASE_3_TASKS.md)

---

## Support

For issues or questions, please open an issue on GitHub.
