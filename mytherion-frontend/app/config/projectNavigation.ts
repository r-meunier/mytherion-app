export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

/**
 * Get unified icon-level navigation (leftmost bar)
 * Includes 'Portal' (Worlds) and project-specific modules
 */
export const getProjectIconItems = (projectId?: string): NavItem[] => [
  { id: "overview", icon: "public", label: "Overview", href: projectId ? `/projects/${projectId}` : "/" },
  { id: "entities", icon: "menu_book", label: "Codex", href: projectId ? `/projects/${projectId}/entities` : "#" },
  { id: "timeline", icon: "history_edu", label: "Timeline", href: "#" },
  { id: "atlas", icon: "map", label: "Atlas", href: "#" },
];

/**
 * Legacy support for global icons
 */
export const getGlobalIconItems = (): NavItem[] => [
  { id: "projects", icon: "public", label: "Worlds", href: "/" },
  ...getProjectIconItems().slice(1)
];

/**
 * Get unified navigation items (middle bar)
 */
export const getProjectNavItems = (projectId?: string): NavItem[] => [
  { id: "overview", label: "Overview", href: projectId ? `/projects/${projectId}` : "/", icon: "public" },
  { id: "entities", label: "Codex", href: projectId ? `/projects/${projectId}/entities` : "#", icon: "menu_book" },
  { id: "timeline", label: "Timeline", href: "#", icon: "history_edu" },
  { id: "characters", label: "Characters", href: "#", icon: "group" },
  { id: "atlas", label: "Atlas", href: "#", icon: "map" },
  { id: "notes", label: "Project Notes", href: "#", icon: "note_alt" },
];

/**
 * Legacy support for global nav
 */
export const getGlobalNavItems = (): NavItem[] => getProjectNavItems();

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
  { id: "settings", label: "Settings", href: "#", icon: "settings" },
  { id: "support", label: "Support", href: "#", icon: "help" },
];

/**
 * Legacy support for global management
 */
export const getGlobalManagementItems = (): NavItem[] => getManagementItems();
