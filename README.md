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

## 🚀 Quick Start (Local Development)

To get the full system running locally, follow these steps:

### 1. Prerequisites
*   **Node.js 20+**
*   **JDK 17+**
*   **Docker & Docker Compose**

### 2. Infrastructure (PostgreSQL & MinIO)
Navigate to the backend directory and start the services:
```bash
cd mytherion-backend
docker compose up -d
```

### 3. Start the Backend
```bash
./gradlew bootRun
```
*API will be available at: `http://localhost:8080`*

### 4. Start the Frontend
In a new terminal, navigate to the frontend directory:
```bash
cd mytherion-frontend
npm install
npm run dev
```
*UI will be available at: `http://localhost:3000`*

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
