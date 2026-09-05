# Mytherion

Mytherion is a worldbuilding and writing platform designed for creators who value structural freedom, versioned data, and AI assistance that operates with the precision of modern coding tools.

**Our Mission:** Writers and Worldbuilders should own their data. We believe that your creative life's work shouldn't be locked inside proprietary ecosystems. Mytherion is built from the ground up to give you absolute sovereignty over your worlds, characters, and narratives.

This repository is a **monorepo** containing both the backend and frontend components of the Mytherion project.

---

## 🏛 Project Architecture

Mytherion is organized into two main services:

### [Backend](./mytherion-backend)

- **Tech Stack:** Kotlin, Spring Boot, PostgreSQL, MinIO.
- **Key Features:** JWT Auth (httpOnly), Project/Codex Entry CRUD, JSONB entry content, Performance monitoring.
- **Primary Purpose:** High-performance API, data persistence, and worldbuilding logic.

### [Frontend](./mytherion-frontend)

- **Tech Stack:** Next.js, React, TypeScript, Redux Toolkit, Tailwind CSS.
- **Key Features:** Responsive dashboard, project management UI, Codex management, modern aesthetics.
- **Primary Purpose:** User interface, project visualization, and creative workflow management.

---

## 🚀 Getting Started

You can run the entire Mytherion stack either using Docker (recommended for a quick start) or by running the services manually.

### Prerequisites

- **Docker & Docker Compose**
- **Node.js 22+** (for manual frontend dev)
- **JDK 24** (for manual backend dev)

### Option 1: Dockerized Setup (One-Click)

This is the easiest way to get the entire stack (Database, MinIO, Mailhog, Backend, and Frontend) running.

From the root directory:

```bash
docker compose up -d --build
```

- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **Mailhog (Email Test):** `http://localhost:8025`
- **MinIO Console:** `http://localhost:9001`

### Option 2: Local Development (Manual)

Use this if you want to develop on a specific service with hot-reloading.

#### 1. Infrastructure (Database & Object Storage)

```bash
cd mytherion-backend
docker compose up -d
```

#### 2. Start the Backend

The backend uses **Spring Profiles** to manage environments.

```bash
cd mytherion-backend
# For development (default):
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### 3. Start the Frontend

```bash
cd mytherion-frontend
npm install
npm run dev
```

### 📱 Local Network Testing

The project is configured for flexible testing across devices:

- **Automatic (Wi-Fi):** If you visit `http://YOUR_COMPUTER_IP:3001` from a phone on the same network, the app will automatically talk to the backend on port `8080` of that IP.
- **Manual Override:** If you need to expose the app via a tunnel (like Ngrok) or a public IP, set `NEXT_PUBLIC_API_URL` in `mytherion-frontend/.env.development`. If this is set to anything other than `localhost`, the automatic detection is disabled and your manual URL is used strictly.

---

## 🧪 Test Users (Development)

When running the backend with the `dev` profile (which is the default in both Docker and manual setups), the database is automatically seeded with the following test accounts:

**All passwords:** `password123`

| Username       | Email                      | Role    | Verified | Projects                         |
| :------------- | :------------------------- | :------ | :------- | :------------------------------- |
| `admin`        | `admin@mytherion.dev`      | `ADMIN` | ✓        | 0                                |
| `testuser`     | `user@mytherion.dev`       | `USER`  | ✓        | 1 (The Shattered Realms)         |
| `newuser`      | `unverified@mytherion.dev` | `USER`  | ✗        | 0                                |
| `emptyuser`    | `empty@mytherion.dev`      | `USER`  | ✓        | 0                                |
| `worldbuilder` | `builder@mytherion.dev`    | `USER`  | ✓        | 3 (Iron Empire, Echoes, Stellar) |

---

## 💡 The Vision

Mytherion is built on three core pillars:

1.  **Structural Freedom:** No rigid boxes. Define your own codex entry types and sections.
2.  **AI as an Engineering Tool:** AI that navigates your Codex dynamically, just like Cursor or Claude Code navigate a codebase.
3.  **Creative Work as Data:** Every project, character, and scene is treated as structured, versioned, and navigable data.

For a deeper dive into the philosophy and future roadmap, see the [Backend Vision](./mytherion-backend/README.md#three-core-pillars).

---

## 📂 Repository Structure

```
mytherion/
├── mytherion-backend/     # Spring Boot API
├── mytherion-frontend/    # Next.js Application
```

---

## 📜 License

This project is currently not licensed for redistribution.
