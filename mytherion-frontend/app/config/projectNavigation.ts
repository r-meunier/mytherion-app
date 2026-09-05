import routes from "./routes";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * Get unified icon-level navigation (leftmost bar)
 * Includes 'Portal' (Projects) and project-specific modules
 */
export const getProjectIconItems = (projectId?: string): NavItem[] => [
  { id: "overview", icon: "public", label: "Overview", href: projectId ? routes.project(projectId).root : routes.home() },
  { id: "codex", icon: "menu_book", label: "Codex", href: projectId ? routes.project(projectId).codex.index() : "#" },
  { id: "planner", icon: "schema", label: "Planner", href: projectId ? routes.project(projectId).planner : "#", badge: "Phase 2", disabled: true },
  { id: "manuscript", icon: "edit_note", label: "Manuscript", href: projectId ? routes.project(projectId).manuscript : "#", badge: "Phase 2", disabled: true },
  { id: "timeline", icon: "history_edu", label: "Timeline", href: projectId ? routes.project(projectId).timeline : "#", badge: "Soon", disabled: true },
  { id: "atlas", icon: "map", label: "Atlas", href: "#", disabled: true },
];

/**
 * Legacy support for global icons
 */
export const getGlobalIconItems = (): NavItem[] => [
  { id: "projects", icon: "public", label: "Projects", href: routes.home() },
  { id: "codex", icon: "menu_book", label: "Codex", href: "#", disabled: true },
  { id: "planner", icon: "schema", label: "Planner", href: "#", badge: "Phase 2", disabled: true },
  { id: "manuscript", icon: "edit_note", label: "Manuscript", href: "#", badge: "Phase 2", disabled: true },
];

/**
 * Get unified navigation items (middle bar)
 */
export const getProjectNavItems = (projectId?: string): NavItem[] => [
  { id: "overview", label: "Overview", href: projectId ? routes.project(projectId).root : routes.home(), icon: "public" },
  { id: "codex", label: "Codex", href: projectId ? routes.project(projectId).codex.index() : "#", icon: "menu_book" },
  { id: "planner", label: "Story Planner", href: projectId ? routes.project(projectId).planner : "#", icon: "schema", badge: "Phase 2", disabled: true },
  { id: "manuscript", label: "Manuscript", href: projectId ? routes.project(projectId).manuscript : "#", icon: "edit_note", badge: "Phase 2", disabled: true },
  { id: "timeline", label: "Timeline", href: projectId ? routes.project(projectId).timeline : "#", icon: "history_edu", badge: "Soon", disabled: true },
  { id: "atlas", label: "Atlas", href: "#", icon: "map", disabled: true },
  { id: "notes", label: "Project Notes", href: "#", icon: "note_alt", disabled: true },
];

/**
 * Legacy support for global nav
 */
export const getGlobalNavItems = (): NavItem[] => [
  { id: "projects", label: "Your Projects", href: routes.home(), icon: "public" },
];

/**
 * Get global library items
 */
export const getGlobalLibraryItems = (): NavItem[] => [
  { id: "bestiary", label: "Bestiary", href: "#", icon: "pets" },
];

/**
 * Get management items (Bottom section)
 */
export const getManagementItems = (projectId?: string): NavItem[] => [
  { id: "settings", label: "Settings", href: projectId ? routes.project(projectId).settings : "#", icon: "settings" },
  { id: "support", label: "Support", href: "#", icon: "help" },
];

/**
 * Legacy support for global management
 */
export const getGlobalManagementItems = (): NavItem[] => getManagementItems();
