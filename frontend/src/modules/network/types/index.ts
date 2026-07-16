import type { Node, Edge } from 'reactflow';

// ─── Entity Types ────────────────────────────────────────────────────────────
export type NetworkEntityType =
  | 'FIR'
  | 'Accused'
  | 'Victim'
  | 'Witness'
  | 'Officer'
  | 'PoliceStation'
  | 'Court'
  | 'BankAccount'
  | 'Phone'
  | 'Vehicle'
  | 'Address'
  | 'District'
  | 'CrimeCategory'
  | 'IPCSection';

// ─── Edge / Relationship Types ────────────────────────────────────────────────
export type NetworkEdgeRelation =
  | 'Committed'
  | 'Reported'
  | 'InvestigatedBy'
  | 'VictimOf'
  | 'AssociatedWith'
  | 'Owns'
  | 'TransferredTo'
  | 'LocatedAt'
  | 'AppearedIn';

// ─── Risk Level ───────────────────────────────────────────────────────────────
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// ─── Node Data ────────────────────────────────────────────────────────────────
export interface NetworkNodeData {
  id: string;
  label: string;
  entityType: NetworkEntityType;
  riskScore: number; // 0–100
  riskLevel: RiskLevel;
  firCount: number;
  district?: string;
  isRepeatOffender?: boolean;
  gang?: string;
  crimeTypes?: string[];
  description?: string;
  expanded?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
  // additional entity-specific fields
  phone?: string;
  address?: string;
  vehicleNumber?: string;
  bankAccount?: string;
  ipcSection?: string;
  officerRank?: string;
  courtType?: string;
  stationCode?: string;
}

// ─── Edge Data ────────────────────────────────────────────────────────────────
export interface NetworkEdgeData {
  relation: NetworkEdgeRelation;
  label?: string;
  strength?: number; // 0–1
  date?: string;
  highlighted?: boolean;
  dimmed?: boolean;
}

// ─── ReactFlow Typed Nodes/Edges ──────────────────────────────────────────────
export type NetworkNode = Node<NetworkNodeData>;
export type NetworkEdge = Edge<NetworkEdgeData>;

// ─── Full Graph ───────────────────────────────────────────────────────────────
export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// ─── Entity Details (Right Panel) ─────────────────────────────────────────────
export interface CrimeHistoryItem {
  firNumber: string;
  crimeType: string;
  date: string;
  status: 'Open' | 'Closed' | 'Pending';
}

export interface ConnectionItem {
  id: string;
  label: string;
  entityType: NetworkEntityType;
  relation: NetworkEdgeRelation;
  riskScore: number;
}

export interface TimelineEvent {
  date: string;
  event: string;
  type: 'arrest' | 'fir' | 'court' | 'release' | 'alert' | 'other';
}

export interface EntityDetails {
  node: NetworkNodeData;
  crimeHistory: CrimeHistoryItem[];
  connections: ConnectionItem[];
  timeline: TimelineEvent[];
  knownAssociates: { id: string; label: string; relation: string }[];
  relatedCases: { id: string; firNumber: string; crimeType: string }[];
  aiSummary: string;
}

// ─── AI Explanation ───────────────────────────────────────────────────────────
export interface InvestigationLead {
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  entities: string[];
}

export interface AIExplanation {
  summary: string;
  hiddenRelationships: string[];
  repeatPatterns: string[];
  keyIndividuals: { name: string; role: string; centrality: number }[];
  suspiciousConnections: string[];
  evidence: string[];
  confidenceScore: number; // 0–100
  investigationLeads: InvestigationLead[];
}

// ─── Filter Options ───────────────────────────────────────────────────────────
export interface NetworkFilterOptions {
  entityTypes: NetworkEntityType[];
  crimeTypes: string[];
  districts: string[];
  policeStation: string;
  dateFrom: string;
  dateTo: string;
  riskLevel: RiskLevel | '';
  gang: string;
  repeatOffenderOnly: boolean;
  status: string;
}

// ─── Saved / Recent Networks ──────────────────────────────────────────────────
export interface SavedNetwork {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  createdAt: string;
  tags: string[];
}

// ─── Node color map (used by EntityNode + Legend + MiniMap) ──────────────────
export const ENTITY_COLORS: Record<NetworkEntityType, string> = {
  FIR: '#3B82F6',           // Blue
  Accused: '#EF4444',       // Red
  Victim: '#22C55E',        // Green
  Witness: '#A8A29E',       // Gray
  Officer: '#A855F7',       // Purple
  PoliceStation: '#F97316', // Orange
  Court: '#14B8A6',         // Teal
  BankAccount: '#EC4899',   // Pink
  Phone: '#06B6D4',         // Cyan
  Vehicle: '#EAB308',       // Yellow
  Address: '#84CC16',       // Lime
  District: '#6366F1',      // Indigo
  CrimeCategory: '#F43F5E', // Rose
  IPCSection: '#8B5CF6',    // Violet
};

// ─── Edge color map ───────────────────────────────────────────────────────────
export const EDGE_COLORS: Record<NetworkEdgeRelation, string> = {
  Committed: '#EF4444',
  Reported: '#3B82F6',
  InvestigatedBy: '#A855F7',
  VictimOf: '#22C55E',
  AssociatedWith: '#F97316',
  Owns: '#EAB308',
  TransferredTo: '#EC4899',
  LocatedAt: '#14B8A6',
  AppearedIn: '#06B6D4',
};

// ─── Entity type labels ───────────────────────────────────────────────────────
export const ENTITY_LABELS: Record<NetworkEntityType, string> = {
  FIR: 'FIR',
  Accused: 'Accused',
  Victim: 'Victim',
  Witness: 'Witness',
  Officer: 'Officer',
  PoliceStation: 'Police Station',
  Court: 'Court',
  BankAccount: 'Bank Account',
  Phone: 'Phone Number',
  Vehicle: 'Vehicle',
  Address: 'Address',
  District: 'District',
  CrimeCategory: 'Crime Category',
  IPCSection: 'IPC Section',
};

// ─── Default filter state ─────────────────────────────────────────────────────
export const DEFAULT_FILTERS: NetworkFilterOptions = {
  entityTypes: [],
  crimeTypes: [],
  districts: [],
  policeStation: '',
  dateFrom: '',
  dateTo: '',
  riskLevel: '',
  gang: '',
  repeatOffenderOnly: false,
  status: '',
};
