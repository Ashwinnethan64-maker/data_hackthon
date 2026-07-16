import { motion } from 'framer-motion';
import { X, Clock, MapPin, ShieldAlert, Award, FileSearch, HelpCircle } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { CaseStatusBadge } from './CaseStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { VictimCard } from './VictimCard';
import { AccusedCard } from './AccusedCard';
import { OfficerCard } from './OfficerCard';
import { EvidenceCard } from './EvidenceCard';
import { QuickActionsPanel } from './QuickActionsPanel';
import type { CaseRecord } from '../types';

interface CaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: CaseRecord | null;
  nearbyCases?: CaseRecord[];
}

export function CaseDrawer({ isOpen, onClose, record, nearbyCases = [] }: CaseDrawerProps) {
  if (!isOpen || !record) return null;

  // Filter nearby related cases (same district or station, excluding current) if not pre-filtered
  const relatedCases = nearbyCases
    .filter((c: CaseRecord) => c.id !== record.id && (c.district === record.district || c.policeStation === record.policeStation))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Drawer Body */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 w-full max-w-2xl border-l border-white/10 bg-slate-950 p-6 shadow-2xl h-screen overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Investigation File</span>
              <PriorityBadge priority={record.priority} />
            </div>
            <h2 className="text-2xl font-bold text-white mt-1.5 font-mono">{record.firNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <CaseStatusBadge status={record.status} />
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Quick AI Summary */}
          <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Quick AI Crime Insight</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              This case involves <strong>{record.crimeCategory.toLowerCase()}</strong> activity registered at {record.policeStation}. The confidence mapping of suspects is currently flagged as {record.priority.toLowerCase()} priority based on {record.accused.filter(a => a.isRepeatOffender).length} repeat offender matches in the local grid.
            </p>
          </div>

          {/* Quick Actions */}
          <QuickActionsPanel
            record={record}
            onLocateOnMap={() => alert(`Locating ${record.firNumber} at Lat: ${record.latitude}, Lng: ${record.longitude}`)}
            onGeneratePdf={() => alert(`Downloading PDF report for ${record.firNumber}`)}
            onAssignOfficer={() => alert(`Reassigning officer for ${record.firNumber}`)}
          />

          {/* General Information */}
          <Card className="space-y-4">
            <h4 className="text-sm font-semibold text-white">General Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Crime Category</p>
                <p className="text-white font-medium mt-0.5">{record.crimeCategory}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Incident Date</p>
                <p className="text-white font-medium mt-0.5">
                  {new Date(record.incidentDate).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">District / Jurisdiction</p>
                <p className="text-white font-medium mt-0.5">{record.district} District</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Police Station</p>
                <p className="text-white font-medium mt-0.5">{record.policeStation}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">GPS Coordinates</p>
                <p className="text-white font-mono mt-0.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan" />
                  {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-slate-500">Incident Description</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-1">{record.description}</p>
            </div>
          </Card>

          {/* Applicable Legal Acts */}
          <Card className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Applicable IPC / BNS Sections</h4>
            <div className="flex flex-wrap gap-2">
              {record.applicableActs.map((act) => (
                <Badge key={act} variant="info" className="text-xs font-mono py-1 px-3">
                  {act}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Officer details */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Investigating Officer</h4>
              <OfficerCard officer={record.officer} />
            </Card>

            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Crime Location Info</h4>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3">
                <div className="rounded-lg bg-info/15 p-2 text-info">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{record.policeStation}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Jurisdiction zone</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Demographics List (Victims & Accused) */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Victims */}
            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Victims ({record.victims.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {record.victims.map((vic, index) => (
                  <VictimCard key={index} victim={vic} />
                ))}
              </div>
            </Card>

            {/* Accused */}
            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Accused ({record.accused.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {record.accused.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3">No suspects identified yet</p>
                ) : (
                  record.accused.map((acc, index) => (
                    <AccusedCard key={index} accused={acc} />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Evidence Summary */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Evidence Exhibits</h4>
              <Badge variant="neutral">Traceable logs</Badge>
            </div>
            <div className="space-y-2">
              {record.evidence.map((ev, index) => (
                <EvidenceCard key={index} evidence={ev} />
              ))}
            </div>
          </Card>

          {/* Case Timeline */}
          <Card className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Investigation Milestones</h4>
            <div className="relative pl-6 space-y-4 border-l border-white/10 ml-2">
              {record.timeline.map((step, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                      step.status === 'completed'
                        ? 'bg-success'
                        : step.status === 'current'
                          ? 'bg-cyan animate-pulse'
                          : 'bg-slate-700'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Nearby Related Cases */}
          <Card className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Nearby Related Cases</h4>
            <div className="space-y-2.5">
              {relatedCases.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No other cases in this jurisdiction</p>
              ) : (
                relatedCases.map((nc: CaseRecord) => (
                  <div
                    key={nc.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-slate-950/40"
                  >
                    <div>
                      <span className="text-xs font-mono text-cyan">{nc.firNumber}</span>
                      <p className="text-sm font-semibold text-white mt-0.5">{nc.crimeCategory}</p>
                    </div>
                    <Badge variant="neutral">{nc.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
