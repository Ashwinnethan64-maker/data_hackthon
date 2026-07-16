import { User } from 'lucide-react';
import type { CaseVictim } from '../types';

interface VictimCardProps {
  victim: CaseVictim;
}

export function VictimCard({ victim }: VictimCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3">
      <div className="rounded-lg bg-cyan/15 p-2 text-cyan">
        <User className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{victim.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {victim.gender} · {victim.age} yrs
        </p>
      </div>
    </div>
  );
}
