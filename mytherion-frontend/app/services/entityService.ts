import axios from 'axios';
import { Entity, CreateEntityRequest, UpdateEntityRequest, EntityType } from '../types/entity';
import logger from '../utils/logger';
import { API_URL } from './apiConfig';
import apiRoutes from '../config/apiRoutes';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'entityService' });

import { Page } from '../types/common';

export type { Page };

export interface EntityFilters {
  type?: EntityType;
  categoryId?: number;
  tags?: string[];
  search?: string;
  page?: number;
  size?: number;
}

export const entityService = {
  // Get entities with filters
  getEntities: async (
    projectId: string,
    filters?: EntityFilters
  ): Promise<Page<Entity>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(filters?.page || 0));
    params.append('size', String(filters?.size || 20));

    serviceLogger.debug('Fetching entities', { projectId, filters });

    try {
      const endpoint = `${API_URL}${apiRoutes.entities.list(projectId)}?${params}`;
      const response = await axios.get(endpoint, {
        withCredentials: true,
      });
      serviceLogger.debug('Entities fetched successfully', { 
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
  getEntity: async (projectId: string, id: string): Promise<Entity> => {
    serviceLogger.debug('Fetching entity', { projectId, entityId: id });

    try {
      const response = await axios.get(`${API_URL}${apiRoutes.entities.detail(projectId, id)}`, {
        withCredentials: true,
      });
      serviceLogger.debug('Entity fetched successfully', { projectId, entityId: id, name: response.data.name });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch entity', error, { projectId, entityId: id });
      throw error;
    }
  },

  // Create entity
  createEntity: async (projectId: string, data: CreateEntityRequest): Promise<Entity> => {
    serviceLogger.debug('Creating entity', { projectId, type: data.type, name: data.name });

    try {
      const response = await axios.post(`${API_URL}${apiRoutes.entities.create(projectId)}`, data, {
        withCredentials: true,
      });
      serviceLogger.debug('Entity created successfully', { 
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
  updateEntity: async (projectId: string, id: string, data: UpdateEntityRequest): Promise<Entity> => {
    serviceLogger.debug('Updating entity', { projectId, entityId: id, updates: Object.keys(data) });

    try {
      const response = await axios.patch(`${API_URL}${apiRoutes.entities.detail(projectId, id)}`, data, {
        withCredentials: true,
      });
      serviceLogger.debug('Entity updated successfully', { projectId, entityId: id });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update entity', error, { projectId, entityId: id, data });
      throw error;
    }
  },

  // Delete entity
  deleteEntity: async (projectId: string, id: string): Promise<void> => {
    serviceLogger.debug('Deleting entity', { projectId, entityId: id });

    try {
      await axios.delete(`${API_URL}${apiRoutes.entities.detail(projectId, id)}`, {
        withCredentials: true,
      });
      serviceLogger.debug('Entity deleted successfully', { projectId, entityId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete entity', error, { projectId, entityId: id });
      throw error;
    }
  },
};

