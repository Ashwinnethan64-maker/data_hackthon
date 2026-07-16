import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import type { AiRelatedCase } from '../types';

interface RelatedCasesProps {
  cases: AiRelatedCase[];
}

export function RelatedCases({ cases }: RelatedCasesProps) {
  return (
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-white">Related Cases</p>
      <div className="space-y-3">
        {cases.map((item) => (
          <Link key={item.firNumber} className="block rounded-2xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-cyan/40 hover:bg-cyan/10" to={`/case/${item.firNumber}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-white">{item.firNumber}</p>
                <p className="mt-1 text-sm text-slate-300">{item.crime}</p>
                <p className="mt-1 text-xs text-slate-500">{item.district} · {item.station}</p>
              </div>
              <Badge variant="neutral">{item.status}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
