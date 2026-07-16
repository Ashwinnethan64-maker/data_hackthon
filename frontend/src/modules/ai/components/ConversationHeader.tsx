import { Clock3, Shield } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';

interface ConversationHeaderProps {
  title: string;
  subtitle: string;
  updatedAt: string;
}

export function ConversationHeader({ title, subtitle, updatedAt }: ConversationHeaderProps) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan/80">AI Investigator</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant="info" className="gap-1">
          <Shield className="h-3.5 w-3.5" />
          Explainable AI
        </Badge>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Last updated {updatedAt}
        </div>
      </div>
    </Card>
  );
}
