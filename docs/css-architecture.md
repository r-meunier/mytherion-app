# CSS Architecture

How the frontend's CSS files are split and loaded. For **which class to use where**, see
[style-guide.md](./style-guide.md).

## The tree

```text
mytherion-frontend/app/styles/
├── base.css      # Root: tokens, Tailwind theme, resets, shared primitives
├── auth.css      # Login and register
├── projects.css  # The projects hub (/)
└── app-core.css  # Everything inside a project (/projects/[projectId]/…)
```

Each child file starts with `@import "./base.css";` and only adds or overrides what its part of the
app needs. Nothing else defines global CSS.

| File | Holds |
| :--- | :--- |
| `base.css` | Tailwind (`@import "tailwindcss"`, `@theme`), brand and text colour tokens, resets (body, scrollbars, selection, Material Symbols), surfaces (`glass-panel`, `glass-container`, `child-panel`…), and the page primitives in `@layer components` (`field-input`, `btn-pill`, `chip`, `section-heading`…). |
| `auth.css` | The darker login/register background, the auth card glass and its atmospheric effects (nebula, starfield, floating symbols). |
| `projects.css` | The projects hub: background, sidebar states (`sidebar-item-active`, nav headers), project card interactions, glow helpers. |
| `app-core.css` | Inside a project: modal glow, `btn-cosmic`, loading and bounce animations. |

## How each part gets its file

Global CSS in Next.js applies to the whole page, so each part of the app imports its file from a layout:

| Layout | Imports |
| :--- | :--- |
| `app/layout.tsx` (root) | `base.css` |
| `app/login/layout.tsx`, `app/register/layout.tsx` | `auth.css` |
| `app/(projects)/layout.tsx` | `projects.css` |
| `app/projects/[projectId]/layout.tsx` | `app-core.css` |

## Conventions

- Shared primitives go in `base.css` inside `@layer components`, so a Tailwind utility on the same
  element still overrides them (`field-input text-lg`). Plain, unlayered rules would beat utilities.
- A token every part shares (`--primary`, `--gold`, fonts) lives in `base.css`. A child overrides a
  token only when its part of the app really looks different (`--background-dark`, `--glass-bg`).
- Each file opens with a Javadoc-style header: `@file`, `@description`, `@inheritance`, and `@section`
  for groups of rules.
