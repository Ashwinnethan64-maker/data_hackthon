import { FileText } from 'lucide-react';
import type { CaseEvidence } from '../types';

interface EvidenceCardProps {
  evidence: CaseEvidence;
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 text-sm">
      <div className="flex items-center gap-2 text-white font-semibold">
        <FileText className="h-4 w-4 text-cyan" />
        <span>{evidence.label}</span>
      </div>
      <p className="mt-1.5 text-slate-300 leading-relaxed">{evidence.value}</p>
      <p className="mt-2 text-xs text-slate-500 font-mono">Source: {evidence.source}</p>
    </div>
  );
}
