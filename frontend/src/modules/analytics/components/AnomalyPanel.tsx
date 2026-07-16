import { AlertTriangle, Clock } from 'lucide-react';
import type { AnomalyAlert } from '../types';

interface AnomalyPanelProps {
  anomalies: AnomalyAlert[];
}

export function AnomalyPanel({ anomalies }: AnomalyPanelProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4 text-orange-400 animate-pulse" />
        Anomaly Detection alerts
      </h3>
      <div className="space-y-3">
        {anomalies.map((an) => (
          <div key={an.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-start gap-2.5">
            <span className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{an.title}</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {an.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{an.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
