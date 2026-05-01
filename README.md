# Mytherion

Mytherion is a worldbuilding and writing platform designed for creators who value structural freedom, versioned data, and AI assistance that operates with the precision of modern coding tools.

This repository is a **monorepo** containing both the backend and frontend components of the Mytherion project.

---

## 🏛 Project Architecture

Mytherion is organized into two main services:

### [Backend](./mytherion-backend)
*   **Tech Stack:** Kotlin, Spring Boot, PostgreSQL, MinIO.
*   **Key Features:** JWT Auth (httpOnly), Project/Entity CRUD, JSONB metadata, Performance monitoring.
*   **Primary Purpose:** High-performance API, data persistence, and worldbuilding logic.

### [Frontend](./mytherion-frontend)
*   **Tech Stack:** Next.js, React, TypeScript, Redux Toolkit, Tailwind CSS.
*   **Key Features:** Responsive dashboard, project management UI, Codex management, modern aesthetics.
*   **Primary Purpose:** User interface, world visualization, and creative workflow management.

---

## 🚀 Getting Started

You can run the entire Mytherion stack either using Docker (recommended for a quick start) or by running the services manually.

### Prerequisites
*   **Docker & Docker Compose**
*   **Node.js 22+** (for manual frontend dev)
*   **JDK 24** (for manual backend dev)

### Option 1: Dockerized Setup (One-Click)
This is the easiest way to get the entire stack (Database, MinIO, Mailhog, Backend, and Frontend) running.

From the root directory:
```bash
docker compose up -d --build
```
*   **Frontend UI:** `http://localhost:3000`
*   **Backend API:** `http://localhost:8080`
*   **Mailhog (Email Test):** `http://localhost:8025`
*   **MinIO Console:** `http://localhost:9001`

### Option 2: Local Development (Manual)
Use this if you want to develop on a specific service with hot-reloading.

#### 1. Infrastructure (Database & Object Storage)
```bash
cd mytherion-backend
docker compose up -d
```

#### 2. Start the Backend
```bash
cd mytherion-backend
./gradlew bootRun
```

#### 3. Start the Frontend
```bash
cd mytherion-frontend
npm install
npm run dev
```

---

## 💡 The Vision

Mytherion is built on three core pillars:
1.  **Structural Freedom:** No rigid boxes. Define your own entity types and metadata.
2.  **AI as an Engineering Tool:** AI that navigates your Codex dynamically, just like Cursor or Claude Code navigate a codebase.
3.  **Creative Work as Data:** Every world, character, and scene is treated as structured, versioned, and navigable data.

For a deeper dive into the philosophy and future roadmap, see the [Backend Vision](./mytherion-backend/README.md#three-core-pillars).

---

## 📂 Repository Structure

```
mytherion/
├── mytherion-backend/     # Spring Boot API
├── mytherion-frontend/    # Next.js Application
└── .git/                  # Monorepo history
```

---

## 📜 License

This project is currently not licensed for redistribution.
