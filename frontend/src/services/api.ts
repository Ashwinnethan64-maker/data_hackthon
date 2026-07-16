import { apiRequest } from '../utils/api';

const API_BASE_URL = '/server/ai-cios-api';

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

export interface CaseRecord {
  ROWID: string;
  firNumber: string;
  crimeCategory: string;
  district: string;
  policeStation: string;
  status: string;
  dateReported: string;
  // Other fields exist but these are what we need for the dashboard
}

export const api = {
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    return await apiRequest<DashboardAnalytics>('/analytics/overview');
  },

  getCases: async (): Promise<CaseRecord[]> => {
    const res = await apiRequest<{ data: CaseRecord[] }>('/cases');
    return res.data || [];
  },
};
