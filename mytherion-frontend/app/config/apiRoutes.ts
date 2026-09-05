/**
 * Centralized Backend REST API Endpoint Manifest
 * Single source of truth for all backend API URLs in Mytherion.
 */

export const apiRoutes = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    verifyEmail: '/api/auth/verify-email',
    resendVerification: '/api/auth/resend-verification',
  },
  health: '/api/health',
  users: {
    list: '/api/user',
    detail: (userId: string | number) => `/api/user/${userId}`,
  },
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    detail: (projectId: string) => `/api/projects/${projectId}`,
    stats: (projectId: string) => `/api/projects/${projectId}/stats`,
  },
  entries: {
    list: (projectId: string) => `/api/projects/${projectId}/entries`,
    create: (projectId: string) => `/api/projects/${projectId}/entries`,
    detail: (projectId: string, entryId: string) => `/api/projects/${projectId}/entries/${entryId}`,
    thumbnail: (projectId: string, entryId: string) => `/api/projects/${projectId}/entries/${entryId}/thumbnail`,
  },
  dashboard: {
    stats: '/api/dashboard/stats',
    projectStats: (projectId: string) => `/api/projects/${projectId}/dashboard/stats`,
  },
  storage: {
    upload: '/api/storage/upload',
    file: (filename: string) => `/api/storage/${filename}`,
  },
} as const;

export default apiRoutes;
