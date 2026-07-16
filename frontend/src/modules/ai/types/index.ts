export type AiRole = 'user' | 'assistant' | 'system';
export type Language = 'en' | 'kn';

export interface AiEvidenceItem {
  label: string;
  value: string;
  source: string;
}

export interface AiRelatedCase {
  firNumber: string;
  crime: string;
  district: string;
  station: string;
  status: string;
}

export interface AiTimelineItem {
  title: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}

export interface AiResponse {
  summary: string;
  evidence: AiEvidenceItem[];
  confidence: number;
  relatedCases: AiRelatedCase[];
  investigationTimeline: AiTimelineItem[];
  suggestedQuestions: string[];
  recommendedActions: string[];
  applicableActs: string[];
}

export interface AiMessage {
  id: string;
  role: AiRole;
  content: string;
  timestamp: string;
  response?: AiResponse;
  isStreaming?: boolean;
  language?: Language;
}

export interface AiConversationThread {
  id: string;
  title: string;
  lastQuery: string;
  updatedAt: string;
  pinned?: boolean;
  saved?: boolean;
}

export interface AiMockCase {
  firNumber: string;
  crime: string;
  district: string;
  station: string;
  status: string;
  suspect: string;
  victim: string;
  acts: string[];
  timeline: AiTimelineItem[];
  evidence: AiEvidenceItem[];
}

export interface AiContext {
  crime?: string;
  district?: string;
  status?: string;
}
