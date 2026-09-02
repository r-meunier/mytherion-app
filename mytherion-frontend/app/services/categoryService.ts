import axios from 'axios';
import { Category, CreateCategoryRequest } from '../types/category';
import logger from '../utils/logger';
import { API_URL } from './apiConfig';

const serviceLogger = logger.child({ service: 'categoryService' });

export const categoryService = {
  // Get all categories for a project
  getCategories: async (projectId: string): Promise<Category[]> => {
    serviceLogger.debug('Fetching categories', { projectId });

    try {
      const response = await axios.get(`${API_URL}/api/projects/${projectId}/categories`, {
        withCredentials: true,
      });
      serviceLogger.debug('Categories fetched successfully', { 
        projectId, 
        count: response.data.length 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to fetch categories', error, { projectId });
      throw error;
    }
  },

  // Create a new category
  createCategory: async (projectId: string, data: CreateCategoryRequest): Promise<Category> => {
    serviceLogger.debug('Creating category', { projectId, name: data.name });

    try {
      const response = await axios.post(`${API_URL}/api/projects/${projectId}/categories`, data, {
        withCredentials: true,
      });
      serviceLogger.debug('Category created successfully', { 
        projectId, 
        categoryId: response.data.id,
        name: response.data.name 
      });
      return response.data;
    } catch (error) {
      serviceLogger.error('Failed to create category', error, { projectId, data });
      throw error;
    }
  },
};
