import type { FIR, Officer, AnalyticsFilters, KPIData, AIInsight, AnomalyAlert } from '../types';
import { apiRequest } from '../../../utils/api';

function buildQuery(filters: AnalyticsFilters): string {
  const params = new URLSearchParams();
  if (filters.dateRange[0]) params.append('dateFrom', filters.dateRange[0]);
  if (filters.dateRange[1]) params.append('dateTo', filters.dateRange[1]);
  if (filters.districts.length > 0) params.append('districts', filters.districts.join(','));
  if (filters.policeStations.length > 0) params.append('policeStations', filters.policeStations.join(','));
  if (filters.crimeCategories.length > 0) params.append('crimeCategories', filters.crimeCategories.join(','));
  if (filters.riskLevels.length > 0) params.append('riskLevels', filters.riskLevels.join(','));
  if (filters.statuses.length > 0) params.append('statuses', filters.statuses.join(','));
  return params.toString();
}

export async function getFilteredFirs(filters: AnalyticsFilters): Promise<FIR[]> {
  const q = buildQuery(filters);
  return apiRequest<FIR[]>(q ? `/analytics/firs?${q}` : '/analytics/firs');
}

export async function getFilteredOfficers(filters: AnalyticsFilters): Promise<Officer[]> {
  const q = buildQuery(filters);
  return apiRequest<Officer[]>(q ? `/analytics/officers?${q}` : '/analytics/officers');
}

export async function fetchKPIsFromServer(filters?: AnalyticsFilters): Promise<KPIData> {
  const q = filters ? buildQuery(filters) : '';
  return apiRequest<KPIData>(q ? `/analytics/overview?${q}` : '/analytics/overview');
}

export async function generateAIInsights(filters: AnalyticsFilters): Promise<AIInsight[]> {
  const q = buildQuery(filters);
  return apiRequest<AIInsight[]>(q ? `/analytics/social-insights?${q}` : '/analytics/social-insights');
}

export async function getAnomalies(filters: AnalyticsFilters): Promise<AnomalyAlert[]> {
  const q = buildQuery(filters);
  return apiRequest<AnomalyAlert[]>(q ? `/analytics/risk-analysis?${q}` : '/analytics/risk-analysis');
}

export async function getForecastData(filters: AnalyticsFilters) {
  const q = buildQuery(filters);
  return apiRequest<any[]>(q ? `/analytics/predictions?${q}` : '/analytics/predictions');
}
