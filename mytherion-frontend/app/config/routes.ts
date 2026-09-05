/**
 * Centralized Frontend UI Route Manifest
 * Single source of truth for all client-side navigation paths in Mytherion.
 */

export const routes = {
  home: () => '/',
  login: () => '/login',
  register: () => '/register',
  verifyEmail: () => '/verify-email',
  forgotPhrase: () => '/forgot-phrase',
  archive: () => '/archive',
  admin: {
    root: () => '/admin',
    users: () => '/admin/users',
  },
  projects: () => '/projects',
  project: (projectId: string) => ({
    root: `/projects/${projectId}`,
    codex: {
      index: (params?: { search?: string; type?: string }) => {
        const base = `/projects/${projectId}/codex`;
        if (!params) return base;
        const searchParams = new URLSearchParams();
        if (params.search && params.search.trim()) {
          searchParams.set('search', params.search.trim());
        }
        if (params.type) {
          searchParams.set('type', params.type);
        }
        const query = searchParams.toString();
        return query ? `${base}?${query}` : base;
      },
      new: () => `/projects/${projectId}/codex/new`,
      detail: (entryId: string) => `/projects/${projectId}/codex/${entryId}`,
      edit: (entryId: string) => `/projects/${projectId}/codex/${entryId}/edit`,
    },
    planner: `/projects/${projectId}/planner`,
    manuscript: `/projects/${projectId}/manuscript`,
    timeline: `/projects/${projectId}/timeline`,
    settings: `/projects/${projectId}/settings`,
  }),
} as const;

export default routes;
