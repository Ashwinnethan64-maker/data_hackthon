import type { MapIncident, MapFilters, AreaAnalysis } from '../types';
import { apiRequest } from '../../../utils/api';

export async function getFilteredIncidents(filters: MapFilters): Promise<MapIncident[]> {
  const searchParams = new URLSearchParams();
  
  if (filters.searchQuery) searchParams.append('searchQuery', filters.searchQuery);
  
  if (filters.districts.length > 0) {
    searchParams.append('districts', filters.districts.join(','));
  }
  if (filters.policeStations.length > 0) {
    searchParams.append('policeStations', filters.policeStations.join(','));
  }
  if (filters.crimeCategories.length > 0) {
    searchParams.append('crimeCategories', filters.crimeCategories.join(','));
  }
  if (filters.riskLevels.length > 0) {
    searchParams.append('riskLevels', filters.riskLevels.join(','));
  }
  if (filters.statuses.length > 0) {
    searchParams.append('statuses', filters.statuses.join(','));
  }
  if (filters.officers.length > 0) {
    searchParams.append('officers', filters.officers.join(','));
  }
  if (filters.dateRange[0]) searchParams.append('dateFrom', filters.dateRange[0]);
  if (filters.dateRange[1]) searchParams.append('dateTo', filters.dateRange[1]);
  if (filters.timeRange[0]) searchParams.append('timeFrom', filters.timeRange[0]);
  if (filters.timeRange[1]) searchParams.append('timeTo', filters.timeRange[1]);

  const queryString = searchParams.toString();
  const url = queryString ? `/map/markers?${queryString}` : '/map/markers';
  
  return apiRequest<MapIncident[]>(url);
}

export async function generateAreaAnalysis(incidents: MapIncident[]): Promise<AreaAnalysis> {
  return apiRequest<AreaAnalysis>('/map/analyze', {
    method: 'POST',
    body: JSON.stringify({ incidents })
  });
}
