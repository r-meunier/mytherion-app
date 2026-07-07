import axios from 'axios';
import logger from '../utils/logger';
import { API_URL } from './apiConfig';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'projectService' });

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  genre?: string;
  entityCount?: number;
}

export interface ProjectStats {
  id: string;
  name: string;
  description: string | null;
  entityCount: number;
  entityCountByType: Record<string, number>;
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
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

export const projectService = {
  async getProjects(page = 0, size = 20, search?: string, genre?: string): Promise<Page<Project>> {    
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (search) params.append('search', search);
      if (genre && genre !== 'all' && genre !== 'none') params.append('genre', genre);
      
      const response = await api.get(`/projects?${params.toString()}`);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch projects', error, { page, size, search, genre });
      throw error;
    }
  },

  async getProject(id: string): Promise<Project> {    
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

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    serviceLogger.info('Updating project', { projectId: id, updates: Object.keys(data) });
    
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update project', error, { projectId: id, data });
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    serviceLogger.info('Deleting project', { projectId: id });
    
    try {
      await api.delete(`/projects/${id}`);
      serviceLogger.info('Project deleted successfully', { projectId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete project', error, { projectId: id });
      throw error;
    }
  },

  async getProjectStats(id: string): Promise<ProjectStats> {
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

