# Mytherion Frontend

Mytherion is a lightweight worldbuilding and codex-style application for organizing creative projects. This repository contains the **Next.js + React + TypeScript frontend** with Redux state management and modern UI design.

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Redux Toolkit** – State management
- **Tailwind CSS** – Styling
- **Jest** – Testing framework

---

## Project Status

✅ **MVP with Authentication**

- User registration and login implemented
- Redux-based state management
- Responsive design
- Session persistence
- Ready for additional features

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
│   ├── components/       # Reusable UI components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── Navbar.tsx
│   ├── services/         # API service layer
│   │   └── authService.ts
│   ├── store/            # Redux store and slices
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   └── hooks.ts
│   ├── types/            # TypeScript type definitions
│   │   └── auth.ts
│   ├── login/            # Login page
│   │   └── page.tsx
│   ├── register/         # Register page
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout with Redux Provider
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── public/               # Static assets
├── .env.local            # Environment variables (create this)
├── jest.config.ts        # Jest configuration
├── jest.setup.ts         # Jest setup
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
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
- **User Login**
  - Email and password authentication
  - Session persistence via httpOnly cookies
  - Automatic session restoration on page refresh
- **Session Management**
  - Redux-based authentication state
  - Persistent sessions across tabs
  - Secure logout with cookie clearing

### UI/UX

- **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interactions
- **Modern Styling**
  - Gradient backgrounds
  - Glassmorphism effects
  - Smooth transitions and animations
  - Purple/blue color scheme
- **Dynamic Navbar**
  - Conditional rendering based on auth state
  - User profile display
  - Quick access to settings and logout

### State Management

- **Redux Toolkit**
  - Centralized auth state
  - Async thunks for API calls
  - Type-safe hooks
  - Error handling

### Security

- **httpOnly Cookies**
  - JWT stored in secure cookies
  - XSS protection
  - CSRF protection (SameSite=Strict)
- **Form Validation**
  - Client-side validation
  - Server-side validation
  - Error message display

---

## API Integration

The frontend communicates with the backend API via the `authService` layer.

### Authentication Endpoints

| Endpoint             | Method | Description       |
| -------------------- | ------ | ----------------- |
| `/api/auth/register` | POST   | Register new user |
| `/api/auth/login`    | POST   | Login user        |
| `/api/auth/logout`   | POST   | Logout user       |
| `/api/auth/me`       | GET    | Get current user  |

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

### Async Thunks

- `registerUser` – Register new user
- `loginUser` – Login user
- `logoutUser` – Logout user
- `checkAuth` – Validate session on page load

### Usage

```typescript
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { loginUser } from "./store/authSlice";

const { user, isAuthenticated, isLoading, error } = useAppSelector(
  (state) => state.auth,
);
const dispatch = useAppDispatch();

// Login
await dispatch(loginUser({ email, password }));
```

---

## Testing

### Unit Tests

Tests are written using Jest and React Testing Library.

```bash
npm test
```

### Test Coverage

- Redux auth slice (20+ tests)
- Component tests (planned)
- Integration tests (planned)

---

## Planned Features

### Short-term

- Protected routes and route guards
- User profile page
- Settings page
- Password reset flow
- Email verification

### Medium-term

- Project management UI
- Entry creation (characters, locations, etc.)
- Rich text editor
- Image uploads
- Search and filtering

### Long-term

- Relationship mapping visualization
- Export functionality (PDF, images)
- AI-assisted content generation
- Collaborative editing
- Mobile app (React Native)

---

## Development Notes

### Code Style

- **TypeScript** for type safety
- **Functional components** with hooks
- **Tailwind CSS** for styling
- **ESLint** for code quality

### Best Practices

- Keep components small and focused
- Use Redux for global state only
- Prefer server components when possible
- Validate on both client and server
- Handle loading and error states

### Performance

- Next.js Turbopack for fast development
- Automatic code splitting
- Image optimization
- CSS optimization

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

Additional documentation can be found in the backend repository:

- [Authentication Future Features](../mytherion-backend/docs/auth-future-features.md)
- [Manual Testing Checklist](../mytherion-backend/docs/auth-manual-testing-checklist.md)

---

## Support

For issues or questions, please open an issue on GitHub.
