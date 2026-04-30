/**
 * Project Navigation Configuration
 * 
 * Centralized configuration for project-level navigation items.
 * Used across all project pages to ensure consistency.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

/**
 * Get navigation items for a specific project
 * @param projectId - The ID of the current project
 * @returns Array of navigation items for the project sidebar
 */
export const getProjectNavItems = (projectId: number): NavItem[] => [
  { id: "overview", label: "Overview", href: `/projects/${projectId}` },
  { id: "entities", label: "Entities", href: `/projects/${projectId}/entities` },
  { id: "timeline", label: "Timeline", href: "#" },
  { id: "maps", label: "Maps", href: "#" },
];

/**
 * Get management items for project sidebar
 * These are consistent across all project pages
 * @returns Array of management/action items
 */
export const getManagementItems = (): NavItem[] => [
  { id: "settings", label: "Settings", href: "#" },
  { id: "export", label: "Export Codex", href: "#" },
];
