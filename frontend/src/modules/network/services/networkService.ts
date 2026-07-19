import type {
  NetworkNode,
  NetworkEdge,
  NetworkFilterOptions,
  EntityDetails,
  AIExplanation,
  SavedNetwork,
} from '../types';
import { apiRequest } from '../../../utils/api';

// ─── Filter Graph ─────────────────────────────────────────────────────────────
export async function getFilteredGraph(filters: NetworkFilterOptions): Promise<{
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}> {
  const searchParams = new URLSearchParams();
  
  if (filters.entityTypes.length > 0) {
    searchParams.append('entityTypes', filters.entityTypes.join(','));
  }
  if (filters.crimeTypes.length > 0) {
    searchParams.append('crimeTypes', filters.crimeTypes.join(','));
  }
  if (filters.districts.length > 0) {
    searchParams.append('districts', filters.districts.join(','));
  }
  if (filters.policeStation) {
    searchParams.append('policeStation', filters.policeStation);
  }
  if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
  if (filters.riskLevel) searchParams.append('riskLevel', filters.riskLevel);
  if (filters.gang) searchParams.append('gang', filters.gang);
  if (filters.repeatOffenderOnly) searchParams.append('repeatOffenderOnly', 'true');
  if (filters.status) searchParams.append('status', filters.status);

  const queryString = searchParams.toString();
  const url = queryString ? `/network/graph?${queryString}` : '/network/graph';
  
  return apiRequest<{ nodes: NetworkNode[], edges: NetworkEdge[] }>(url);
}

// ─── Initial Graph ────────────────────────────────────────────────────────────
export async function getNetworkGraph(): Promise<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> {
  return apiRequest<{ nodes: NetworkNode[], edges: NetworkEdge[] }>('/network/graph');
}

// ─── Full Graph (all nodes) ───────────────────────────────────────────────────
export async function getFullGraph(): Promise<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> {
  return apiRequest<{ nodes: NetworkNode[], edges: NetworkEdge[] }>('/network/graph?full=true');
}

// ─── Search Entities ──────────────────────────────────────────────────────────
export async function searchEntities(query: string): Promise<NetworkNode[]> {
  if (!query.trim()) return [];
  const q = encodeURIComponent(query);
  return apiRequest<NetworkNode[]>(`/network/search?q=${q}`);
}

// ─── Expand Node (get connected nodes not yet in graph) ───────────────────────
export async function expandNode(
  nodeId: string,
  existingNodeIds: Set<string>,
): Promise<{ nodes: NetworkNode[]; edges: NetworkEdge[] }> {
  const q = Array.from(existingNodeIds).join(',');
  return apiRequest<{ nodes: NetworkNode[], edges: NetworkEdge[] }>(`/network/expand/${nodeId}?existing=${encodeURIComponent(q)}`);
}

// ─── Get Connected Node IDs ───────────────────────────────────────────────────
// For UI highlighting, we can rely on existing edges rather than fetching from backend
export function getConnectedNodeIds(nodeId: string, currentEdges: NetworkEdge[] = []): Set<string> {
  const ids = new Set<string>([nodeId]);
  currentEdges.forEach((e) => {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  });
  return ids;
}

// ─── Entity Details ───────────────────────────────────────────────────────────
export async function getEntityDetails(nodeId: string): Promise<EntityDetails | null> {
  return apiRequest<EntityDetails>(`/network/details/${nodeId}`);
}

// ─── AI Explanation ───────────────────────────────────────────────────────────
export async function generateAIExplanation(filters?: NetworkFilterOptions): Promise<AIExplanation> {
  const searchParams = new URLSearchParams();
  if (filters) {
    if (filters.entityTypes.length > 0) {
      searchParams.append('entityTypes', filters.entityTypes.join(','));
    }
    if (filters.crimeTypes.length > 0) {
      searchParams.append('crimeTypes', filters.crimeTypes.join(','));
    }
    if (filters.districts.length > 0) {
      searchParams.append('districts', filters.districts.join(','));
    }
    if (filters.policeStation) {
      searchParams.append('policeStation', filters.policeStation);
    }
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    if (filters.riskLevel) searchParams.append('riskLevel', filters.riskLevel);
    if (filters.gang) searchParams.append('gang', filters.gang);
    if (filters.repeatOffenderOnly) searchParams.append('repeatOffenderOnly', 'true');
    if (filters.status) searchParams.append('status', filters.status);
  }
  const queryString = searchParams.toString();
  const url = queryString ? `/network/explanation?${queryString}` : '/network/explanation';
  return apiRequest<AIExplanation>(url);
}

// ─── Saved / Recent Networks ──────────────────────────────────────────────────
export function getSavedNetworks(): SavedNetwork[] {
  return [];
}

export function getRecentNetworks(): SavedNetwork[] {
  return [];
}

// ─── Available filters ────────────────────────────────────────────────────────
export const AVAILABLE_DISTRICTS = [
  'Bengaluru Urban',
  'Mysuru',
  'Hubballi-Dharwad',
  'Kalaburagi',
  'Ballari',
  'Tumakuru',
  'Belagavi',
  'Mangaluru',
];

export const AVAILABLE_CRIME_TYPES = [
  'Robbery',
  'Murder',
  'Cyber Fraud',
  'Drug Trafficking',
  'Kidnapping',
  'Extortion',
  'Theft',
  'Assault',
];

export const AVAILABLE_GANGS = [
  'Bengaluru Robbery Gang',
  'Kalaburagi Drug Network',
  'Cyber Fraud Ring',
  'Hubballi Extortion Group',
  'Mysuru Jewel Thieves',
];
