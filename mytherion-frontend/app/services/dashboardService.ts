import axios from 'axios';
import { Entity } from '../types/entity';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface DashboardStats {
  totalEntities: number;
  entitiesThisWeek: number;
  recentEdits: number;
  totalProjects: number;
  recentEntities: Entity[];
  lastUpdated: string;
}

const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axios.get<DashboardStats>(`${API_URL}/api/dashboard/stats`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default dashboardService;
