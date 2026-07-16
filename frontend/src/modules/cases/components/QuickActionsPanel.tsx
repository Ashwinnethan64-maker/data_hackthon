import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Network, MapPin, Download, UserCheck } from 'lucide-react';
import { Card } from '../../../components/Card';
import type { CaseRecord } from '../types';

interface QuickActionsPanelProps {
  record: CaseRecord;
  onLocateOnMap?: () => void;
  onGeneratePdf?: () => void;
  onAssignOfficer?: () => void;
}

export function QuickActionsPanel({
  record,
  onLocateOnMap,
  onGeneratePdf,
  onAssignOfficer,
}: QuickActionsPanelProps) {
  const navigate = useNavigate();

  const handleOpenAi = () => {
    // Navigate to AI Investigator workspace, pre-populating query context
    navigate('/ai', { state: { query: `Summarize FIR ${record.firNumber}` } });
  };

  const handleOpenNetwork = () => {
    // Navigate to Criminal Network workspace
    navigate('/network', { state: { caseId: record.id } });
  };

  return (
    <Card className="space-y-4 bg-slate-950/40 border border-white/5">
      <div>
        <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
        <p className="text-xs text-slate-400 mt-0.5">Operate on case intelligence</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={handleOpenAi}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <Brain className="h-4 w-4 text-cyan" />
          <span>Ask AI Investigator</span>
        </button>

        <button
          onClick={handleOpenNetwork}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <Network className="h-4 w-4 text-cyan" />
          <span>Criminal Network</span>
        </button>

        <button
          onClick={onLocateOnMap}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <MapPin className="h-4 w-4 text-cyan" />
          <span>Locate on Map</span>
        </button>

        <button
          onClick={onGeneratePdf}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <Download className="h-4 w-4 text-cyan" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={onAssignOfficer}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <UserCheck className="h-4 w-4 text-cyan" />
          <span>Assign Officer</span>
        </button>

        <button
          onClick={() => alert(`Generating Summary for ${record.firNumber}...`)}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <FileText className="h-4 w-4 text-cyan" />
          <span>Generate Summary</span>
        </button>
      </div>
    </Card>
  );
}
