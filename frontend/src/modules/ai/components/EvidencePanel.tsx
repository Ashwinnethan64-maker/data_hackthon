import { Shield, Scale } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import type { AiResponse } from '../types';

interface EvidencePanelProps {
  response: AiResponse;
}

export function EvidencePanel({ response }: EvidencePanelProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Shield className="h-4 w-4 text-cyan" />
          Evidence Panel
        </div>
        <Badge variant="info">Supporting Records</Badge>
      </div>

      <div className="space-y-2.5">
        {response.evidence.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No direct physical or digital evidence cited.</p>
        ) : (
          response.evidence.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs">
              <div className="flex justify-between font-semibold text-white">
                <span>{item.label}</span>
                <span className="text-[10px] text-slate-500 font-normal">{item.source}</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-300">{item.value}</p>
            </div>
          ))
        )}
      </div>

      {response.applicableActs && response.applicableActs.length > 0 && (
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Scale className="h-3.5 w-3.5 text-cyan" />
            <span>Applicable Legal Acts</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {response.applicableActs.map((act) => (
              <Badge key={act} variant="info" className="text-[10px]">
                {act}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
