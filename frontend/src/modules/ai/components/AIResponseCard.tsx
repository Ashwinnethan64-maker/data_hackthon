import { ArrowUpRight, FileText } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import type { AiResponse } from '../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface AIResponseCardProps {
  response: AiResponse;
}

export function AIResponseCard({ response }: AIResponseCardProps) {
  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Summary</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{response.summary}</p>
        </div>
        <ConfidenceBadge value={response.confidence} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Evidence</p>
            <Badge variant="info">Traceable</Badge>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            {response.evidence.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-slate-950/30 px-3 py-3">
                <p className="font-semibold text-white">{item.label}</p>
                <p className="mt-1 leading-6 text-slate-300">{item.value}</p>
                <p className="mt-2 text-xs text-slate-500">Source: {item.source}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Related Cases</p>
          <div className="space-y-3 text-sm text-slate-300">
            {response.relatedCases.map((item) => (
              <div key={item.firNumber} className="rounded-2xl border border-white/5 bg-slate-950/30 px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-white">{item.firNumber}</p>
                    <p className="mt-1 text-slate-300">
                      {item.crime} · {item.district} · {item.station}
                    </p>
                  </div>
                  <Badge variant="neutral">{item.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Investigation Timeline</p>
          <div className="mt-4 space-y-3">
            {response.investigationTimeline.map((item) => (
              <div key={item.title} className="flex items-start gap-3 text-sm text-slate-300">
                <div
                  className={[
                    'mt-1 h-2.5 w-2.5 rounded-full',
                    item.status === 'completed'
                      ? 'bg-success'
                      : item.status === 'current'
                        ? 'bg-cyan'
                        : 'bg-slate-600',
                  ].join(' ')}
                />
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Suggested Questions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {response.suggestedQuestions.map((question) => (
              <Badge key={question} variant="info">
                {question}
              </Badge>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {response.applicableActs.map((act) => (
              <Badge key={act} variant="neutral">
                {act}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/40 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {response.recommendedActions.map((action) => (
            <Badge key={action} variant="neutral">
              {action}
            </Badge>
          ))}
        </div>
        <Button variant="secondary" className="shrink-0">
          <FileText className="h-4 w-4" />
          Export PDF
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
