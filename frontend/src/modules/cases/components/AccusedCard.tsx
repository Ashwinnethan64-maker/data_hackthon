import { AlertTriangle, UserMinus } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import type { CaseAccused } from '../types';

interface AccusedCardProps {
  accused: CaseAccused;
}

export function AccusedCard({ accused }: AccusedCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-danger/15 p-2 text-danger">
          <UserMinus className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{accused.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {accused.gender} · {accused.age} yrs
          </p>
        </div>
      </div>
      {accused.isRepeatOffender && (
        <Badge variant="danger" className="gap-1 text-[10px] py-0.5 px-1.5 font-bold uppercase">
          <AlertTriangle className="h-3 w-3" />
          Repeat
        </Badge>
      )}
    </div>
  );
}
