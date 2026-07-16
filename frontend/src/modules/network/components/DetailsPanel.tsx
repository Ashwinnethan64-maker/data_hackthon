import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, Clock, GitBranch, FileText,
  ExternalLink, Brain, Map, FileDown, GitMerge,
  Shield, User, Eye, Building2, Landmark, CreditCard,
  Phone, Car, MapPin, Scale, RefreshCw,
} from 'lucide-react';
import type { EntityDetails, NetworkEntityType } from '../types';
import { ENTITY_COLORS, ENTITY_LABELS } from '../types';

const ICONS: Record<NetworkEntityType, React.ElementType> = {
  FIR: FileText, Accused: User, Victim: Eye, Witness: Eye,
  Officer: Shield, PoliceStation: Building2, Court: Landmark,
  BankAccount: CreditCard, Phone: Phone, Vehicle: Car,
  Address: MapPin, District: Map, CrimeCategory: AlertTriangle, IPCSection: Scale,
};

const RISK_CONFIG = {
  Critical: { color: '#EF4444', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  High: { color: '#F97316', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  Medium: { color: '#EAB308', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  Low: { color: '#22C55E', bg: 'bg-green-500/15', border: 'border-green-500/30' },
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  arrest: Shield, fir: FileText, court: Landmark,
  release: User, alert: AlertTriangle, other: Clock,
};

const TIMELINE_COLORS: Record<string, string> = {
  arrest: '#EF4444', fir: '#3B82F6', court: '#14B8A6',
  release: '#22C55E', alert: '#F97316', other: '#94A3B8',
};

interface DetailsPanelProps {
  details: EntityDetails | null;
  isLoading: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export function DetailsPanel({ details, isLoading, onClose }: DetailsPanelProps) {
  const show = isLoading || !!details;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          className="absolute right-0 top-0 bottom-0 z-30 w-[320px] flex flex-col border-l border-white/8 bg-navy/95 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-white/8 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Entity Details
              </span>
              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={20} className="text-cyan animate-spin" />
                <p className="text-xs text-slate-500">Loading details…</p>
              </div>
            </div>
          )}

          {!isLoading && details && (
            <div className="flex-1 overflow-y-auto">
              {/* Entity header */}
              <EntityHeader details={details} />

              {/* Tabs content */}
              <div className="px-4 pb-4 space-y-4">
                {/* Quick AI Summary */}
                <AISummaryCard summary={details.aiSummary} />

                {/* Crime History */}
                {details.crimeHistory.length > 0 && (
                  <Section title="Crime History" icon={<FileText size={11} />}>
                    {details.crimeHistory.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <p className="text-[11px] font-semibold text-slate-200">{item.firNumber}</p>
                          <p className="text-[9px] text-slate-500">{item.crimeType} · {item.date}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    ))}
                  </Section>
                )}

                {/* Connections */}
                {details.connections.length > 0 && (
                  <Section title="Connections" icon={<GitBranch size={11} />}>
                    {details.connections.slice(0, 6).map((conn) => {
                      const color = ENTITY_COLORS[conn.entityType];
                      return (
                        <div key={conn.id} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                          <div
                            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${color}22` }}
                          >
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-slate-200 truncate">{conn.label}</p>
                            <p className="text-[9px] text-slate-500">{ENTITY_LABELS[conn.entityType]}</p>
                          </div>
                          {conn.riskScore > 0 && (
                            <span className="text-[9px] font-bold" style={{ color }}>
                              {conn.riskScore}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </Section>
                )}

                {/* Timeline */}
                <Section title="Timeline" icon={<Clock size={11} />}>
                  <div className="relative pl-4">
                    <div className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
                    {details.timeline.map((event, i) => {
                      const color = TIMELINE_COLORS[event.type];
                      const Icon = TIMELINE_ICONS[event.type] ?? Clock;
                      return (
                        <div key={i} className="relative mb-3 last:mb-0">
                          <div
                            className="absolute -left-[13px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
                          >
                            <Icon size={8} style={{ color }} />
                          </div>
                          <p className="text-[10px] font-medium text-slate-200">{event.event}</p>
                          <p className="text-[9px] text-slate-500">{event.date}</p>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* Known Associates */}
                {details.knownAssociates.length > 0 && (
                  <Section title="Known Associates" icon={<GitMerge size={11} />}>
                    {details.knownAssociates.slice(0, 5).map((assoc) => (
                      <div key={assoc.id} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15">
                          <User size={9} className="text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium text-slate-200 truncate">{assoc.label}</p>
                          <p className="text-[9px] text-slate-500">{assoc.relation}</p>
                        </div>
                      </div>
                    ))}
                  </Section>
                )}

                {/* Related Cases */}
                {details.relatedCases.length > 0 && (
                  <Section title="Related FIRs" icon={<FileText size={11} />}>
                    {details.relatedCases.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-[11px] font-semibold text-police">{c.firNumber}</p>
                          <p className="text-[9px] text-slate-500">{c.crimeType}</p>
                        </div>
                        <button className="text-slate-500 hover:text-cyan transition-colors">
                          <ExternalLink size={11} />
                        </button>
                      </div>
                    ))}
                  </Section>
                )}

                {/* Quick Actions */}
                <QuickActions />
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function EntityHeader({ details }: { details: EntityDetails }) {
  const { node } = details;
  const color = ENTITY_COLORS[node.entityType];
  const risk = RISK_CONFIG[node.riskLevel];
  const Icon = ICONS[node.entityType];

  return (
    <div className="px-4 py-4 border-b border-white/8">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate">{node.label}</h2>
          <p className="text-[10px] text-slate-400">{ENTITY_LABELS[node.entityType]}</p>
          {node.district && (
            <p className="text-[10px] text-slate-500">{node.district}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex items-center gap-2">
        {/* Risk score */}
        <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${risk.bg} ${risk.border}`}>
          <AlertTriangle size={10} style={{ color: risk.color }} />
          <div>
            <p className="text-[8px] text-slate-500 leading-none">Risk</p>
            <p className="text-[11px] font-bold leading-none" style={{ color: risk.color }}>
              {node.riskScore} · {node.riskLevel}
            </p>
          </div>
        </div>

        {/* FIR count */}
        {node.firCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/15 px-2.5 py-1.5">
            <FileText size={10} className="text-blue-400" />
            <div>
              <p className="text-[8px] text-slate-500 leading-none">FIRs</p>
              <p className="text-[11px] font-bold leading-none text-blue-400">{node.firCount}</p>
            </div>
          </div>
        )}

        {/* Repeat offender badge */}
        {node.isRepeatOffender && (
          <div className="rounded-lg border border-orange-500/30 bg-orange-500/15 px-2 py-1.5">
            <p className="text-[9px] font-bold text-orange-400">REPEAT</p>
          </div>
        )}
      </div>

      {/* Gang */}
      {node.gang && (
        <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5">
          <p className="text-[9px] text-slate-500">Gang / Network</p>
          <p className="text-[11px] font-semibold text-red-300">{node.gang}</p>
        </div>
      )}
    </div>
  );
}

function AISummaryCard({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Brain size={11} className="text-purple-400" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400">
          AI Quick Summary
        </p>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-300">{summary}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="text-slate-500">{icon}</div>
        <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: 'Open' | 'Closed' | 'Pending' }) {
  const colors = {
    Open: 'bg-green-500/15 text-green-400',
    Closed: 'bg-slate-500/15 text-slate-400',
    Pending: 'bg-yellow-500/15 text-yellow-400',
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${colors[status]}`}>
      {status}
    </span>
  );
}

function QuickActions() {
  const actions = [
    { label: 'Open FIR', icon: FileText, color: '#3B82F6' },
    { label: 'AI Investigator', icon: Brain, color: '#A855F7' },
    { label: 'Crime Map', icon: Map, color: '#14B8A6' },
    { label: 'Generate PDF', icon: FileDown, color: '#F97316' },
    { label: 'Expand Graph', icon: GitMerge, color: '#06B6D4' },
  ];

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {actions.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 px-2.5 py-2 text-[10px] font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
          >
            <Icon size={11} style={{ color }} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

