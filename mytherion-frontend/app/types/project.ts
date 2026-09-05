/**
 * Project / Project domain interfaces and request models
 */

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  genre?: string;
  entryCount?: number;
  userId?: string;
}

export interface ProjectStats {
  id: string;
  name: string;
  description: string | null;
  entryCount: number;
  entryCountByType: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  genre: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  genre?: string;
}
