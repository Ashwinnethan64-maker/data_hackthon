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
export type CaseStatus = 'Open' | 'Closed' | 'Pending';
export type CasePriority = 'Routine' | 'High' | 'Critical';

export interface FIR {
  id: string;
  firNumber: string;
  crimeCategory: CrimeCategory;
  incidentDate: string; // YYYY-MM-DD
  time: string; // HH:mm
  district: string;
  policeStation: string;
  officerId: string;
  status: CaseStatus;
  priority: CasePriority;
  riskLevel: RiskLevel;
  victimCount: number;
  accusedCount: number;
  riskScore: number;
  mo: string; // modus operandi
  victimAge: number;
  victimGender: 'Male' | 'Female' | 'Other';
  accusedGender: 'Male' | 'Female' | 'Other';
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  district: string;
  policeStation: string;
  casesAssigned: number;
  casesSolved: number;
  avgClosureTimeDays: number;
}

export interface AnalyticsFilters {
  dateRange: [string | null, string | null];
  districts: string[];
  policeStations: string[];
  crimeCategories: CrimeCategory[];
  officers: string[];
  riskLevels: RiskLevel[];
  statuses: CaseStatus[];
  victimGender?: 'Male' | 'Female' | 'Other' | 'All';
  accusedGender?: 'Male' | 'Female' | 'Other' | 'All';
  ageRange?: [number, number];
}

export interface KPIData {
  totalFirs: number;
  activeCases: number;
  solvedCases: number;
  pendingCases: number;
  repeatOffenders: number;
  riskIndex: number; // 0-100
  avgInvestigationTime: number; // days
  trendPercentage: number; // compare to previous period
}

export interface AIInsight {
  id: string;
  summary: string;
  supportingEvidence: string;
  confidenceScore: number;
  suggestedAction: string;
  relatedCases: string[];
}

export interface AnomalyAlert {
  id: string;
  type: 'Spike' | 'Pattern' | 'Overload' | 'Cluster';
  title: string;
  description: string;
  severity: 'Info' | 'Warning' | 'Critical';
  timestamp: string;
}
