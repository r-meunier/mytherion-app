import axios from 'axios';
import { Entity } from '../types/entity';
import { API_URL } from './apiConfig';

export interface DashboardStats {
  totalEntities: number;
  entitiesThisWeek: number;
  recentEdits: number;
  totalProjects: number;
  recentEntities: Entity[];
  entityCountByType: Record<string, number>;
  lastUpdated: string;
}

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}/api/dashboard/stats`, {
      withCredentials: true
    });
    return response.data;
  },

  getProjectStats: async (projectId: string): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}/api/projects/${projectId}/dashboard/stats`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default dashboardService;
