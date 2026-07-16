import type { AiConversationThread, AiMockCase } from '../types';

export const conversationThreads: AiConversationThread[] = [
  {
    id: 'thread-burglary',
    title: 'Bengaluru burglary sweep',
    lastQuery: 'Show burglary cases in Bengaluru',
    updatedAt: '2 min ago',
    pinned: true,
    saved: true,
  },
  {
    id: 'thread-repeat-offenders',
    title: 'Repeat offender analysis',
    lastQuery: 'Find repeat offenders linked across districts',
    updatedAt: '18 min ago',
    pinned: true,
  },
  {
    id: 'thread-hotspots',
    title: 'Hotspot monitoring',
    lastQuery: 'Show crime hotspots in Mysuru',
    updatedAt: '41 min ago',
  },
];

export const savedSearches = [
  'Burglary cases in Bengaluru',
  'Cybercrime by police station',
  'Repeat offenders across districts',
  'IPC 302 cases from this year',
];

export const recentQueries = [
  'Summarize FIR 104430006202600001',
  'Find similar cases to a robbery in Bengaluru South',
  'Explain this suspect network',
  'Show crimes in Mysuru',
];

export const mockCases: AiMockCase[] = [
  {
    firNumber: '104430006202600001',
    crime: 'Burglary',
    district: 'Bengaluru',
    station: 'Madhavara PS',
    status: 'Under Investigation',
    suspect: 'A-14',
    victim: 'Residential owner',
    acts: ['IPC 457', 'IPC 380'],
    timeline: [
      { title: 'FIR Registered', time: '12 Jun 2026 · 08:30', status: 'completed' },
      { title: 'Scene Inspection', time: '12 Jun 2026 · 11:10', status: 'completed' },
      { title: 'Evidence Collected', time: '13 Jun 2026 · 16:20', status: 'current' },
      { title: 'Arrest Pending', time: 'Pending', status: 'pending' },
    ],
    evidence: [
      { label: 'Recovered tool marks', value: 'Match with 2 prior burglary scenes', source: 'Forensic report #FR-204' },
      { label: 'CCTV review', value: 'Suspect seen near rear entry point', source: 'Station evidence log' },
      { label: 'Witness statement', value: 'Vehicle observed leaving at 22:40', source: 'Statement S-118' },
    ],
  },
  {
    firNumber: '104430006202600017',
    crime: 'Robbery',
    district: 'Mysuru',
    station: 'Vijayanagara PS',
    status: 'Open',
    suspect: 'A-07',
    victim: 'Retail shop owner',
    acts: ['IPC 392', 'IPC 34'],
    timeline: [
      { title: 'FIR Registered', time: '21 Jun 2026 · 20:15', status: 'completed' },
      { title: 'Witness Interviews', time: '22 Jun 2026 · 09:20', status: 'current' },
      { title: 'Suspect Tracking', time: 'In progress', status: 'pending' },
    ],
    evidence: [
      { label: 'Route analysis', value: 'Similar escape path seen in 3 nearby cases', source: 'Movement log' },
      { label: 'Phone trace', value: 'Device active in same district on multiple incidents', source: 'CDR summary' },
    ],
  },
  {
    firNumber: '104430006202600024',
    crime: 'Cybercrime',
    district: 'Bengaluru',
    station: 'Whitefield PS',
    status: 'Under Review',
    suspect: 'A-22',
    victim: 'Private employee',
    acts: ['IT Act 66D', 'IPC 419'],
    timeline: [
      { title: 'Complaint Received', time: '01 Jul 2026 · 10:05', status: 'completed' },
      { title: 'Transaction Analysis', time: '01 Jul 2026 · 15:50', status: 'current' },
      { title: 'Bank coordination', time: 'Pending', status: 'pending' },
    ],
    evidence: [
      { label: 'Money trail', value: 'Five linked accounts with repeated transfer patterns', source: 'Finance analysis' },
      { label: 'IP history', value: 'Same IP used in 2 prior fraud complaints', source: 'Network trace' },
    ],
  },
];
