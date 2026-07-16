export type CrimeCategory =
  | 'Murder'
  | 'Robbery'
  | 'Burglary'
  | 'Cyber Crime'
  | 'Drug Crime'
  | 'Kidnapping'
  | 'Fraud'
  | 'Violence'
  | 'Traffic Crime'
  | 'Theft'
  | 'Extortion'
  | 'Assault';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Closed' | 'Pending';
export type IncidentPriority = 'Routine' | 'High' | 'Critical';

export interface MapIncident {
  id: string;
  firNumber: string;
  category: CrimeCategory;
  date: string; // ISO format preferred for parsing
  time: string; // HH:mm format
  district: string;
  policeStation: string;
  officer: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  riskLevel: RiskLevel;
  victimCount: number;
  accusedCount: number;
  lat: number;
  lng: number;
  description?: string;
}

export interface MapFilters {
  searchQuery: string;
  dateRange: [string | null, string | null]; // ISO dates
  timeRange: [string | null, string | null]; // HH:mm
  districts: string[];
  policeStations: string[];
  crimeCategories: CrimeCategory[];
  riskLevels: RiskLevel[];
  statuses: IncidentStatus[];
  officers: string[];
  repeatOffendersOnly: boolean;
}

export const DEFAULT_FILTERS: MapFilters = {
  searchQuery: '',
  dateRange: [null, null],
  timeRange: [null, null],
  districts: [],
  policeStations: [],
  crimeCategories: [],
  riskLevels: [],
  statuses: [],
  officers: [],
  repeatOffendersOnly: false,
};

export interface AIInvestigationLead {
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  relatedEntities: string[];
}

export interface AreaAnalysis {
  summary: string;
  mostCommonCrimes: { category: string; count: number }[];
  repeatOffenders: number;
  emergingTrends: string[];
  riskScore: number;
  recommendedPatrolStrategy: string;
  nearbyCriminalNetworks: string[];
  suggestedLeads: AIInvestigationLead[];
  confidenceScore: number;
}
