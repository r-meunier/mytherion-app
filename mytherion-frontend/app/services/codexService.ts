import axios from 'axios';
import { CodexEntry, CreateEntryRequest, UpdateEntryRequest, EntryType } from '../types/codex';
import logger from '../utils/logger';
import { API_URL } from './apiConfig';
import apiRoutes from '../config/apiRoutes';

// Create a child logger for this service
const serviceLogger = logger.child({ service: 'codexService' });

import { Page } from '../types/common';

export type { Page };

export interface EntryFilters {
  type?: EntryType;
  tags?: string[];
  search?: string;
  page?: number;
  size?: number;
}

export const codexService = {
  // Get entries with filters
  getEntries: async (
    projectId: string,
    filters?: EntryFilters
  ): Promise<Page<CodexEntry>> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(filters?.page || 0));
    params.append('size', String(filters?.size || 20));

    serviceLogger.debug('Fetching entries', { projectId, filters });

    try {
      const endpoint = `${API_URL}${apiRoutes.entries.list(projectId)}?${params}`;
      const response = await axios.get(endpoint, {
        withCredentials: true,
      });
      serviceLogger.debug('Entries fetched successfully', { 
        projectId, 
        count: response.data.content.length,
        totalElements: response.data.totalElements 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch entries', error, { projectId, filters });
      throw error;
    }
  },

  // Get single entry
  getEntry: async (projectId: string, id: string): Promise<CodexEntry> => {
    serviceLogger.debug('Fetching entry', { projectId, entryId: id });

    try {
      const response = await axios.get(`${API_URL}${apiRoutes.entries.detail(projectId, id)}`, {
        withCredentials: true,
      });
      serviceLogger.debug('Entry fetched successfully', { projectId, entryId: id, name: response.data.name });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch entry', error, { projectId, entryId: id });
      throw error;
    }
  },

  // Create entry
  createEntry: async (projectId: string, data: CreateEntryRequest): Promise<CodexEntry> => {
    serviceLogger.debug('Creating entry', { projectId, type: data.type, name: data.name });

    try {
      const response = await axios.post(`${API_URL}${apiRoutes.entries.create(projectId)}`, data, {
        withCredentials: true,
      });
      serviceLogger.debug('Entry created successfully', { 
        projectId, 
        entryId: response.data.id,
        name: response.data.name 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to create entry', error, { projectId, data });
      throw error;
    }
  },

  // Update entry
  updateEntry: async (projectId: string, id: string, data: UpdateEntryRequest): Promise<CodexEntry> => {
    serviceLogger.debug('Updating entry', { projectId, entryId: id, updates: Object.keys(data) });

    try {
      const response = await axios.patch(`${API_URL}${apiRoutes.entries.detail(projectId, id)}`, data, {
        withCredentials: true,
      });
      serviceLogger.debug('Entry updated successfully', { projectId, entryId: id });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to update entry', error, { projectId, entryId: id, data });
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (projectId: string, id: string): Promise<void> => {
    serviceLogger.debug('Deleting entry', { projectId, entryId: id });

    try {
      await axios.delete(`${API_URL}${apiRoutes.entries.detail(projectId, id)}`, {
        withCredentials: true,
      });
      serviceLogger.debug('Entry deleted successfully', { projectId, entryId: id });
    } catch (error) {
      serviceLogger.error('Failed to delete entry', error, { projectId, entryId: id });
      throw error;
    }
  },
};

