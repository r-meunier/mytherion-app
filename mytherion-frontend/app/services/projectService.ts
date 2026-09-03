import axios from 'axios';
import logger from '../utils/logger';
import { API_URL } from './apiConfig';
import apiRoutes from '../config/apiRoutes';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'projectService' });

import { Project, ProjectStats, CreateProjectRequest, UpdateProjectRequest } from '../types/project';
import { Page } from '../types/common';

export type { Project, ProjectStats, CreateProjectRequest, UpdateProjectRequest, Page };

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

export const projectService = {
  async getProjects(page = 0, size = 20, search?: string, genre?: string, sortBy?: string, sortDir?: string): Promise<Page<Project>> {    
    try {
      const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
      if (search) params.append('search', search);
      if (genre && genre !== 'all' && genre !== 'none') params.append('genre', genre);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortDir) params.append('sortDir', sortDir);
      
      const response = await api.get(`${apiRoutes.projects.list}?${params.toString()}`);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch projects', error, { page, size, search, genre, sortBy, sortDir });
      throw error;
    }
  },

  async getProject(id: string): Promise<Project> {    
    try {
      const response = await api.get(apiRoutes.projects.detail(id));
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch project', error, { projectId: id });
      throw error;
    }
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    serviceLogger.debug('Creating project', { name: data.name });
    
    try {
      const response = await api.post(apiRoutes.projects.create, data);
      serviceLogger.debug('Project created successfully', { 
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
    serviceLogger.debug('Updating project', { projectId: id, updates: Object.keys(data) });
    
    try {
      const response = await api.put(apiRoutes.projects.detail(id), data);
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update project', error, { projectId: id, data });
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    serviceLogger.debug('Deleting project', { projectId: id });
    
    try {
      await api.delete(apiRoutes.projects.detail(id));
      serviceLogger.debug('Project deleted successfully', { projectId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete project', error, { projectId: id });
      throw error;
    }
  },

  async getProjectStats(id: string): Promise<ProjectStats> {
    serviceLogger.debug('Fetching project stats', { projectId: id });
    
    try {
      const response = await api.get(apiRoutes.projects.stats(id));
      serviceLogger.debug('Project stats fetched successfully', { 
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

