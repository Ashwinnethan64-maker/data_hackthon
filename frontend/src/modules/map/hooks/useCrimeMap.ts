import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import type { MapFilters, MapIncident, AreaAnalysis } from '../types';
import { DEFAULT_FILTERS } from '../types';
import { getFilteredIncidents, generateAreaAnalysis } from '../services/mapService';

export function useCrimeMap() {
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [selectedIncident, setSelectedIncident] = useState<MapIncident | null>(null);
  
  const location = useLocation();
  const state = location.state as { focusIncidentId?: string; center?: [number, number] } | null;
  
  // Layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [showClusters, setShowClusters] = useState(true);
  
  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [areaAnalysis, setAreaAnalysis] = useState<AreaAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch filtered incidents via React Query
  const { data: incidents = [] } = useQuery({
    queryKey: ['mapMarkers', filters],
    queryFn: () => getFilteredIncidents(filters),
    placeholderData: (previousData) => previousData, // keep old data while fetching new ones
    refetchInterval: 30000, // Poll every 30s for live updates
  });

  // Automatically select incoming target incident if loaded
  useEffect(() => {
    if (state?.focusIncidentId && incidents.length > 0 && !selectedIncident) {
      const matched = incidents.find(inc => String(inc.id) === String(state.focusIncidentId));
      if (matched) {
        setSelectedIncident(matched);
      }
    }
  }, [state, incidents, selectedIncident]);

  const updateFilters = useCallback((newFilters: Partial<MapFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Clear selection when filters change significantly
    setSelectedIncident(null);
  }, []);

  const analyzeCurrentArea = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      // Pass currently filtered incidents
      const analysis = await generateAreaAnalysis(incidents);
      setAreaAnalysis(analysis);
    } catch (err) {
      setAnalysisError('Failed to analyze area.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [incidents]);

  return {
    filters,
    updateFilters,
    incidents,
    selectedIncident,
    setSelectedIncident,
    showHeatmap,
    setShowHeatmap,
    mapType,
    setMapType,
    showClusters,
    setShowClusters,
    isAnalyzing,
    areaAnalysis,
    analysisError,
    analyzeCurrentArea,
    clearAnalysis: () => setAreaAnalysis(null),
    initialCenter: state?.center,
  };
}
