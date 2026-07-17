import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Database } from 'lucide-react';
import type { AiRelatedCase } from '../types';

interface RelatedCasesProps {
  cases: AiRelatedCase[];
}

export function RelatedCases({ cases }: RelatedCasesProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Database className="h-4 w-4 text-cyan" />
        <span>Related Cases</span>
      </div>

      <div className="space-y-2">
        {cases.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No related case records found.</p>
        ) : (
          cases.map((item) => (
            <Link 
              key={item.firNumber} 
              className="block rounded-xl border border-white/5 bg-white/5 px-2.5 py-2 transition hover:border-cyan/45 hover:bg-cyan/5" 
              to={`/case/${item.firNumber}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-white">{item.firNumber}</p>
                  <p className="mt-0.5 text-xs text-slate-355">{item.crime}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{item.district} · {item.station}</p>
                </div>
                <Badge variant="neutral" className="text-[9px] px-1.5 py-0.5">{item.status}</Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
