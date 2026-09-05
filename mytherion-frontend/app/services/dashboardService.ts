import axios from 'axios';
import { CodexEntry } from '../types/codex';
import { API_URL } from './apiConfig';
import apiRoutes from '../config/apiRoutes';

export interface DashboardStats {
  totalEntities: number;
  entitiesThisWeek: number;
  recentEdits: number;
  totalProjects: number;
  recentEntities: CodexEntry[];
  entityCountByType: Record<string, number>;
  lastUpdated: string;
}

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}${apiRoutes.dashboard.stats}`, {
      withCredentials: true
    });
    return response.data;
  },

  getProjectStats: async (projectId: string): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}${apiRoutes.dashboard.projectStats(projectId)}`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default dashboardService;
