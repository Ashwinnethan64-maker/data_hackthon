import { apiRequest } from '../utils/api';

export interface DashboardAnalytics {
  totalFirs: number;
  activeCases: number;
  solvedCases: number;
  pendingCases: number;
  repeatOffenders: number;
  riskIndex: number;
  avgInvestigationTime: number;
  trendPercentage: number;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  crimeCategory: string;
  location: string;
  firNumber?: string;
  caseId?: string;
  timestamp: string;
  message: string;
}

export interface CaseRecord {
  ROWID: string;
  firNumber: string;
  crimeCategory: string;
  district: string;
  policeStation: string;
  status: string;
  priorityLevel?: string;
  priority?: string;
  dateReported?: string;
  incidentDate?: string;
}

export const api = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    return await apiRequest<DashboardAnalytics>('/analytics/overview');
  },

  getCases: async (): Promise<CaseRecord[]> => {
    const res = await apiRequest<{ data: CaseRecord[] }>('/cases?limit=10');
    return res.data || [];
  },

  getAlerts: async (): Promise<AlertItem[]> => {
    return await apiRequest<AlertItem[]>('/system/alerts');
  },
};
