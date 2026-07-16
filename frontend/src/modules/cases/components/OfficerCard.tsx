import { ShieldCheck } from 'lucide-react';
import type { CaseOfficer } from '../types';

interface OfficerCardProps {
  officer: CaseOfficer;
}

export function OfficerCard({ officer }: OfficerCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3">
      <div className="rounded-lg bg-success/15 p-2 text-success">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{officer.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{officer.rank}</p>
      </div>
    </div>
  );
}
