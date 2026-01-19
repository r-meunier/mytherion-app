import axios from 'axios';
import { Entity, CreateEntityRequest, UpdateEntityRequest, EntityType } from '../types/entity';
import logger from '../utils/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'entityService' });

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}

export const entityService = {
  // Get entities with filters
  getEntities: async (
    projectId: number,
    filters?: {
      type?: EntityType;
      tags?: string[];
      search?: string;
      page?: number;
      size?: number;
    }
  ): Promise<Page<Entity>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(filters?.page || 0));
    params.append('size', String(filters?.size || 20));

    serviceLogger.debug('Fetching entities', { projectId, filters });

    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}/entities?${params}`, {
        withCredentials: true,
      });
      serviceLogger.info('Entities fetched successfully', { 
        projectId, 
        count: response.data.content.length,
        totalElements: response.data.totalElements 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch entities', error, { projectId, filters });
      throw error;
    }
  },

  // Get single entity
  getEntity: async (id: number): Promise<Entity> => {
    serviceLogger.debug('Fetching entity', { entityId: id });

    try {
      const response = await axios.get(`${API_URL}/entities/${id}`, {
        withCredentials: true,
      });
      serviceLogger.info('Entity fetched successfully', { entityId: id, name: response.data.name });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch entity', error, { entityId: id });
      throw error;
    }
  },

  // Create entity
  createEntity: async (projectId: number, data: CreateEntityRequest): Promise<Entity> => {
    serviceLogger.info('Creating entity', { projectId, type: data.type, name: data.name });

    try {
      const response = await axios.post(`${API_URL}/projects/${projectId}/entities`, data, {
        withCredentials: true,
      });
      serviceLogger.info('Entity created successfully', { 
        projectId, 
        entityId: response.data.id,
        name: response.data.name 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to create entity', error, { projectId, data });
      throw error;
    }
  },

  // Update entity
  updateEntity: async (id: number, data: UpdateEntityRequest): Promise<Entity> => {
    serviceLogger.info('Updating entity', { entityId: id, updates: Object.keys(data) });

    try {
      const response = await axios.patch(`${API_URL}/entities/${id}`, data, {
        withCredentials: true,
      });
      serviceLogger.info('Entity updated successfully', { entityId: id });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update entity', error, { entityId: id, data });
      throw error;
    }
  },

  // Delete entity
  deleteEntity: async (id: number): Promise<void> => {
    serviceLogger.info('Deleting entity', { entityId: id });

    try {
      await axios.delete(`${API_URL}/entities/${id}`, {
        withCredentials: true,
      });
      serviceLogger.info('Entity deleted successfully', { entityId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete entity', error, { entityId: id });
      throw error;
    }
  },
};

