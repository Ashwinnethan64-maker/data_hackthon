import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Network, MapPin, Download, UserCheck } from 'lucide-react';
import { Card } from '../../../components/Card';
import type { CaseRecord } from '../types';

interface QuickActionsPanelProps {
  record: CaseRecord;
  onAssignOfficer?: () => void;
}

export function QuickActionsPanel({
  record,
  onAssignOfficer,
}: QuickActionsPanelProps) {
  const navigate = useNavigate();

  const handleOpenAi = () => {
    // Navigate to AI Investigator workspace, pre-populating query context
    navigate('/ai', { state: { query: `Analyze case ${record.firNumber} details, suspect involvement, acts, and evidence status.` } });
  };

  const handleOpenNetwork = () => {
    // Navigate to Criminal Network workspace, pre-populating target case node
    navigate('/network', { state: { caseId: record.id, firNumber: record.firNumber } });
  };

  const handleLocateOnMap = () => {
    // Navigate to GIS map and focus on the coordinates of this case
    navigate('/map', { state: { focusIncidentId: record.id, center: [record.latitude, record.longitude] } });
  };

  const handleExportPdf = () => {
    // Open the backend export-pdf route to download the official FIR PDF
    window.open(`/server/ai-cios/cases/${record.id || (record as any).ROWID}/export-pdf`, '_blank');
  };

  const handleGenerateSummary = () => {
    // Navigate to AI Investigator workspace, requesting a formatted executive summary of this case
    navigate('/ai', { state: { query: `Generate an executive intelligence summary report of FIR ${record.firNumber}. Include incident details, victim/accused summaries, acts, and timeline.` } });
  };

  return (
    <Card className="space-y-4 bg-slate-950/40 border border-white/5">
      <div>
        <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
        <p className="text-xs text-slate-400 mt-0.5">Operate on case intelligence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
          onClick={handleLocateOnMap}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <MapPin className="h-4 w-4 text-cyan" />
          <span>Locate on Map</span>
        </button>

        <button
          onClick={handleExportPdf}
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
          onClick={handleGenerateSummary}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-left text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
        >
          <FileText className="h-4 w-4 text-cyan" />
          <span>Generate Summary</span>
        </button>
      </div>
    </Card>
  );
}
