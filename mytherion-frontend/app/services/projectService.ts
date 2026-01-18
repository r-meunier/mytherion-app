import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  id: number;
  name: string;
  description: string | null;
  entityCount: number;
  entityCountByType: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectService = {
  async getProjects(page = 0, size = 20): Promise<Page<Project>> {
    const response = await api.get(`/projects?page=${page}&size=${size}`);
    return response.data;
  },

  async getProject(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getProjectStats(id: number): Promise<ProjectStats> {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },
};
