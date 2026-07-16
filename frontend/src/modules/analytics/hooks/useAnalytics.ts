import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AnalyticsFilters, FIR, Officer, KPIData, AIInsight, AnomalyAlert } from '../types';
import { getFilteredFirs, getFilteredOfficers, fetchKPIsFromServer, generateAIInsights, getAnomalies, getForecastData } from '../services/analyticsService';

const INITIAL_FILTERS: AnalyticsFilters = {
  dateRange: [null, null],
  districts: [],
  policeStations: [],
  crimeCategories: [],
  officers: [],
  riskLevels: [],
  statuses: [],
  victimGender: 'All',
  accusedGender: 'All',
  ageRange: [18, 100]
};

export function useAnalytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>(INITIAL_FILTERS);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { data: filteredFirs = [] } = useQuery<FIR[]>({
    queryKey: ['firs', filters],
    queryFn: () => getFilteredFirs(filters),
  });

  const { data: filteredOfficers = [] } = useQuery<Officer[]>({
    queryKey: ['officers', filters],
    queryFn: () => getFilteredOfficers(filters),
  });

  const { data: kpis = {
    totalFirs: 0,
    activeCases: 0,
    solvedCases: 0,
    pendingCases: 0,
    repeatOffenders: 0,
    riskIndex: 0,
    avgInvestigationTime: 0,
    trendPercentage: 0
  } } = useQuery<KPIData>({
    queryKey: ['kpis', filters],
    queryFn: () => fetchKPIsFromServer(filters),
  });

  const { data: anomalies = [] } = useQuery<AnomalyAlert[]>({
    queryKey: ['anomalies', filters],
    queryFn: () => getAnomalies(filters),
  });

  const { data: forecastData = [] } = useQuery<any[]>({
    queryKey: ['forecast', filters],
    queryFn: () => getForecastData(filters),
  });

  const { data: aiInsights = [], refetch: refetchInsights } = useQuery<AIInsight[]>({
    queryKey: ['insights', filters],
    queryFn: () => getAIInsightsWithState(filters),
    enabled: false,
  });

  const getAIInsightsWithState = async (f: AnalyticsFilters) => {
    setIsGeneratingAI(true);
    try {
      return await generateAIInsights(f);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const triggerAIInsights = useCallback(() => {
    refetchInsights();
  }, [refetchInsights]);

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredFirs,
    filteredOfficers,
    kpis,
    anomalies,
    forecastData,
    aiInsights,
    isGeneratingAI,
    triggerAIInsights
  };
}
