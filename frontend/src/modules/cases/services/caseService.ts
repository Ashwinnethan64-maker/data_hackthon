import type { CaseRecord } from '../types';
import { apiRequest } from '../../../utils/api';

export interface PaginatedCasesResponse {
  data: CaseRecord[];
  pagination: {
    totalRecords: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const caseService = {
  async getAllCases(params: Record<string, any> = {}): Promise<PaginatedCasesResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `/cases?${queryString}` : '/cases';
    
    return apiRequest<PaginatedCasesResponse>(url);
  },

  async getCaseByFir(firNumber: string): Promise<CaseRecord | undefined> {
    return apiRequest<CaseRecord | undefined>(`/cases/${encodeURIComponent(firNumber)}`).catch(() => undefined);
  },

  async createCase(record: Omit<CaseRecord, 'id' | 'officer'> & { officerId?: string }): Promise<CaseRecord> {
    return apiRequest<CaseRecord>('/cases', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  async updateCase(id: string, record: Partial<CaseRecord> & { officerId?: string }): Promise<CaseRecord> {
    return apiRequest<CaseRecord>(`/cases/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  },

  async deleteCase(id: string): Promise<{ success: boolean; deletedRecord: CaseRecord }> {
    return apiRequest<{ success: boolean; deletedRecord: CaseRecord }>(`/cases/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async getOfficers(): Promise<any[]> {
    return apiRequest<any[]>('/auth/officers');
  },
};

