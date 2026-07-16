export interface CaseVictim {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
}

export interface CaseAccused {
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  isRepeatOffender: boolean;
}

export interface CaseOfficer {
  name: string;
  rank: string;
}

export interface CaseEvidence {
  label: string;
  value: string;
  source: string;
}

export interface CaseTimelineItem {
  title: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}

export interface CaseRecord {
  id: string;
  firNumber: string;
  crimeCategory: string;
  district: string;
  policeStation: string;
  latitude: number;
  longitude: number;
  victims: CaseVictim[];
  accused: CaseAccused[];
  officer: CaseOfficer;
  incidentDate: string;
  status: 'Open' | 'Under Investigation' | 'Under Review' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  applicableActs: string[];
  description: string;
  evidence: CaseEvidence[];
  timeline: CaseTimelineItem[];
}

export interface CaseFilterOptions {
  searchQuery: string;
  crimeCategory: string;
  district: string;
  policeStation: string;
  status: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
  ipcSection: string;
  officerName: string;
  hasRepeatOffender: boolean | null;
  victimGender: string;
  victimAgeMin: number | '';
  victimAgeMax: number | '';
  accusedGender: string;
  accusedAgeMin: number | '';
  accusedAgeMax: number | '';
}
