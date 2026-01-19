import axios from 'axios';
import logger from '../utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'projectService' });

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
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

export const projectService = {
  async getProjects(page = 0, size = 20): Promise<Page<Project>> {    
    try {
      const response = await api.get(`/projects?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch projects', error, { page, size });
      throw error;
    }
  },

  async getProject(id: number): Promise<Project> {    
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch project', error, { projectId: id });
      throw error;
    }
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    serviceLogger.info('Creating project', { name: data.name });
    
    try {
      const response = await api.post('/projects', data);
      serviceLogger.info('Project created successfully', { 
        projectId: response.data.id,
        name: response.data.name ,
        userId: response.data.userId
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to create project', error, { data });
      throw error;
    }
  },

  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    serviceLogger.info('Updating project', { projectId: id, updates: Object.keys(data) });
    
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update project', error, { projectId: id, data });
      throw error;
    }
  },

  async deleteProject(id: number): Promise<void> {
    serviceLogger.info('Deleting project', { projectId: id });
    
    try {
      await api.delete(`/projects/${id}`);
      serviceLogger.info('Project deleted successfully', { projectId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete project', error, { projectId: id });
      throw error;
    }
  },

  async getProjectStats(id: number): Promise<ProjectStats> {
    serviceLogger.debug('Fetching project stats', { projectId: id });
    
    try {
      const response = await api.get(`/projects/${id}/stats`);
      serviceLogger.info('Project stats fetched successfully', { 
        projectId: id,
        entityCount: response.data.entityCount 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch project stats', error, { projectId: id });
      throw error;
    }
  },
};

