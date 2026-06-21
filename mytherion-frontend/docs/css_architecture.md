# Mytherion CSS Architecture: The Inheritance Tree

## Overview

The Mytherion frontend utilizes a hierarchical CSS architecture inspired by object-oriented inheritance principles (similar to a Java Interface and its implementations). This approach ensures brand consistency while allowing specialized "looks" for different application sections.

## Hierarchy Structure

The architecture is centered around the `app/styles/` directory:

```text
app/styles/
├── base.css        # The "Interface" (Root foundation)
├── auth.css        # Child: Login & Register portal
├── projects.css    # Child: Projects Dashboard (Entrypoint)
└── app-core.css    # Child: Main Application (Editor/Management)
```

### 1. `base.css` (The Interface)
- **Role**: Defines the core DNA of the design system.
- **Contents**: 
    - Tailwind foundations (`@import`, `@theme`).
    - Global semantic variables (Brand colors, typography tokens).
    - Universal resets (Scrollbars, selection, body baseline).
    - Shared design primitives (Standard glassmorphism, gold text).
- **Usage**: Must be imported by all other section-specific files.

### 2. `auth.css` (The Library Look)
- **Role**: Implements the high-fidelity design for login and registration.
- **Design Specification**: Strictly follows `design/login` and `design/register`.
- **Specializations**:
    - Ultra-dark background (`#050510`).
    - High-opacity glass cards (`0.4`).
    - Atmospheric effects (Nebula, Starfield, Floating Symbols).

### 3. `projects.css` (The Arcane Dashboard)
- **Role**: Manages the visual experience of the world library.
- **Specializations**:
    - Deep purple-tinted dashboard background.
    - Sidebar navigation states and specific typography.
    - Project card interaction patterns.

### 4. `app-core.css` (The World Look)
- **Role**: Provides the standard look for the inner application experience.
- **Specializations**:
    - Modal systems and entity management UI.
    - Complex animations (Loading bars, subtle bounces).
    - Shared application-wide utilities.

## Implementation in Next.js

Isolation is achieved through Next.js Layouts:

- **Root Layout (`app/layout.tsx`)**: Imports `base.css`.
- **Auth Routes**: Use `app/login/layout.tsx` which imports `auth.css`.
- **Dashboard**: Uses the `(dashboard)` route group layout which imports `projects.css`.
- **App Core**: Sub-layouts under `app/projects/[projectId]/` import `app-core.css`.

## Coding Standards

All CSS files use **Javadoc-style comments** to document:
- `@file`: Purpose of the file.
- `@inheritance`: Relationships in the tree.
- `@section`: Logical groupings of styles.
- `@utility`: Tailwind utility definitions.
