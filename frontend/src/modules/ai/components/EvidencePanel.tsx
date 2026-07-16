import { Shield, FileSearch } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import type { AiResponse } from '../types';

interface EvidencePanelProps {
  response: AiResponse;
}

export function EvidencePanel({ response }: EvidencePanelProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Shield className="h-4 w-4 text-cyan" />
        Evidence Panel
      </div>
      <div className="space-y-3">
        {response.evidence.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3 text-sm">
            <p className="font-semibold text-white">{item.label}</p>
            <p className="mt-1 leading-6 text-slate-300">{item.value}</p>
            <p className="mt-2 text-xs text-slate-500">{item.source}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">Supporting Records</Badge>
        <Badge variant="neutral">Traceable</Badge>
      </div>
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-sm text-slate-300">
        <div className="flex items-center gap-2 text-white">
          <FileSearch className="h-4 w-4 text-cyan" />
          Evidence status
        </div>
        <p className="mt-2 leading-6">The current answer is based on structured mock records until backend data is connected.</p>
      </div>
    </Card>
  );
}
