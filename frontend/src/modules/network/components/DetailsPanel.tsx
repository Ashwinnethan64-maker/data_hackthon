import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, Clock, GitBranch, FileText,
  ExternalLink, Brain, Map, FileDown, GitMerge,
  Shield, User, Eye, Building2, Landmark, CreditCard,
  Phone, Car, MapPin, Scale, RefreshCw, LayoutGrid,
  History, Network,
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
  Critical: { color: '#EF4444', bg: 'bg-red-500/15', border: 'border-red-500/30', glow: '#EF444430' },
  High: { color: '#F97316', bg: 'bg-orange-500/15', border: 'border-orange-500/30', glow: '#F9731630' },
  Medium: { color: '#EAB308', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', glow: '#EAB30830' },
  Low: { color: '#22C55E', bg: 'bg-green-500/15', border: 'border-green-500/30', glow: '#22C55E30' },
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  arrest: Shield, fir: FileText, court: Landmark,
  release: User, alert: AlertTriangle, other: Clock,
};

const TIMELINE_COLORS: Record<string, string> = {
  arrest: '#EF4444', fir: '#3B82F6', court: '#14B8A6',
  release: '#22C55E', alert: '#F97316', other: '#94A3B8',
};

type Tab = 'overview' | 'history' | 'network' | 'timeline';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'history', label: 'History', icon: History },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

interface DetailsPanelProps {
  details: EntityDetails | null;
  isLoading: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export function DetailsPanel({ details, isLoading, onClose }: DetailsPanelProps) {
  const show = isLoading || !!details;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          className="absolute right-0 top-0 bottom-0 z-30 w-[380px] flex flex-col border-l border-slate-800 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(8,17,32,0.98) 0%, rgba(12,20,40,0.98) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-slate-800 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Entity Profile
              </span>
              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800/40 hover:text-slate-200 transition-all duration-150"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={20} className="text-cyan animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Loading details…</p>
              </div>
            </div>
          )}

          {!isLoading && details && (
            <>
              {/* Entity header (always visible above tabs) */}
              <EntityHeader details={details} />

              {/* Tab bar */}
              <div className="flex-shrink-0 flex border-b border-slate-800 bg-slate-900/30">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all duration-150 border-b-2 ${
                        isActive
                          ? 'text-cyan border-cyan bg-cyan/5'
                          : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
                      }`}
                    >
                      <Icon size={12} className={isActive ? 'text-cyan' : 'text-slate-500'} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 py-5 space-y-5"
                  >
                    {activeTab === 'overview' && <OverviewTab details={details} />}
                    {activeTab === 'history' && <HistoryTab details={details} />}
                    {activeTab === 'network' && <NetworkTab details={details} />}
                    {activeTab === 'timeline' && <TimelineTab details={details} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sticky Quick Actions footer */}
              <div className="flex-shrink-0 border-t border-slate-800 px-5 py-4 bg-navy/90">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Open FIR Record', icon: FileText, color: '#3B82F6' },
                    { label: 'AI Investigation', icon: Brain, color: '#A855F7' },
                    { label: 'District Crime Map', icon: Map, color: '#14B8A6' },
                    { label: 'Generate PDF Report', icon: FileDown, color: '#F97316' },
                    { label: 'Expand Connections', icon: GitMerge, color: '#06B6D4' },
                    { label: 'View Related Cases', icon: ExternalLink, color: '#22C55E' },
                  ].map(({ label, icon: Icon, color }) => (
                    <button
                      key={label}
                      className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-[10px] font-bold text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all duration-150 text-left"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ backgroundColor: `${color}15` }}>
                        <Icon size={11} style={{ color }} />
                      </div>
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── Entity Header ─────────────────────────────────────────────────────────────
function EntityHeader({ details }: { details: EntityDetails }) {
  const { node } = details;
  const color = ENTITY_COLORS[node.entityType];
  const risk = RISK_CONFIG[node.riskLevel];
  const Icon = ICONS[node.entityType];

  return (
    <div
      className="flex-shrink-0 px-4 py-4 border-b border-slate-900"
      style={{
        background: `linear-gradient(135deg, transparent 0%, ${risk.glow} 100%)`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Entity icon */}
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{
            backgroundColor: `${color}20`,
            border: `1.5px solid ${color}55`,
            boxShadow: `0 0 20px ${color}22`,
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate">{node.label}</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{ENTITY_LABELS[node.entityType]}</p>
          {node.district && (
            <p className="text-[10px] text-slate-500">{node.district}</p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Risk */}
        <div className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 ${risk.bg} ${risk.border}`}>
          <AlertTriangle size={10} style={{ color: risk.color }} />
          <div>
            <p className="text-[7px] text-slate-500 leading-none">Risk</p>
            <p className="text-[11px] font-bold leading-none" style={{ color: risk.color }}>
              {node.riskScore} · {node.riskLevel}
            </p>
          </div>
        </div>

        {/* FIR count */}
        {node.firCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/15 px-2.5 py-1.5">
            <FileText size={10} className="text-blue-400" />
            <div>
              <p className="text-[7px] text-slate-500 leading-none">FIRs</p>
              <p className="text-[11px] font-bold leading-none text-blue-400">{node.firCount}</p>
            </div>
          </div>
        )}

        {/* Repeat offender */}
        {node.isRepeatOffender && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/15 px-2.5 py-1.5">
            <p className="text-[9px] font-black text-orange-400">REPEAT</p>
          </div>
        )}
      </div>

      {/* Gang */}
      {node.gang && node.gang !== 'Unknown' && (
        <div className="mt-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2">
          <p className="text-[8px] text-slate-500 mb-0.5">Gang / Network</p>
          <p className="text-[11px] font-semibold text-red-300">{node.gang}</p>
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ details }: { details: EntityDetails }) {
  return (
    <>
      {/* AI Summary */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/8 p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-purple-500/20">
            <Brain size={10} className="text-purple-400" />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400">AI Quick Summary</p>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300">{details.aiSummary}</p>
      </div>

      {/* Description */}
      {details.node.description && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</p>
          <p className="text-[11px] leading-relaxed text-slate-300">{details.node.description}</p>
        </div>
      )}

      {/* Crime types */}
      {details.node.crimeTypes && details.node.crimeTypes.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Crime Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {details.node.crimeTypes.map(ct => (
              <span
                key={ct}
                className="rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[9px] font-semibold text-red-300"
              >
                {ct}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ details }: { details: EntityDetails }) {
  if (details.crimeHistory.length === 0) {
    return <EmptyTabState message="No crime history available" />;
  }
  return (
    <div className="space-y-1.5">
      {details.crimeHistory.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 hover:bg-slate-800/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200">{item.firNumber}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.crimeType}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">{item.date}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Network Tab ──────────────────────────────────────────────────────────────
function NetworkTab({ details }: { details: EntityDetails }) {
  return (
    <div className="space-y-4">
      {/* Direct connections */}
      {details.connections.length > 0 && (
        <div>
          <SectionHeading icon={<GitBranch size={10} />} title={`Connections (${details.connections.length})`} />
          <div className="space-y-1">
            {details.connections.slice(0, 8).map((conn) => {
              const color = ENTITY_COLORS[conn.entityType];
              return (
                <div key={conn.id} className="flex items-center gap-2.5 rounded-xl border border-slate-900 bg-slate-900/25 px-3 py-2 hover:bg-slate-800/20 transition-colors">
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}22`, border: `1px solid ${color}33` }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-200 truncate">{conn.label}</p>
                    <p className="text-[8px] text-slate-500">{ENTITY_LABELS[conn.entityType]} · {conn.relation}</p>
                  </div>
                  {conn.riskScore > 0 && (
                    <span className="text-[10px] font-bold flex-shrink-0" style={{ color }}>
                      {conn.riskScore}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Known Associates */}
      {details.knownAssociates.length > 0 && (
        <div>
          <SectionHeading icon={<User size={10} />} title={`Associates (${details.knownAssociates.length})`} />
          <div className="space-y-1">
            {details.knownAssociates.slice(0, 5).map((assoc) => (
              <div key={assoc.id} className="flex items-center gap-2.5 rounded-xl border border-slate-900 bg-slate-900/25 px-3 py-2 hover:bg-slate-800/20 transition-colors">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                  <User size={9} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-200 truncate">{assoc.label}</p>
                  <p className="text-[8px] text-slate-500">{assoc.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Cases */}
      {details.relatedCases.length > 0 && (
        <div>
          <SectionHeading icon={<FileText size={10} />} title={`Related FIRs (${details.relatedCases.length})`} />
          <div className="space-y-1">
            {details.relatedCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-900/25 px-3 py-2 hover:bg-slate-800/20 transition-colors">
                <div>
                  <p className="text-[11px] font-bold text-blue-400">{c.firNumber}</p>
                  <p className="text-[9px] text-slate-500">{c.crimeType}</p>
                </div>
                <button className="text-slate-600 hover:text-cyan transition-colors">
                  <ExternalLink size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.connections.length === 0 && details.knownAssociates.length === 0 && (
        <EmptyTabState message="No network connections found" />
      )}
    </div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
function TimelineTab({ details }: { details: EntityDetails }) {
  if (details.timeline.length === 0) {
    return <EmptyTabState message="No timeline events available" />;
  }
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gradient-to-b from-slate-800 via-slate-900 to-transparent" />

      {details.timeline.map((event, i) => {
        const color = TIMELINE_COLORS[event.type];
        const Icon = TIMELINE_ICONS[event.type] ?? Clock;
        const isFirst = i === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`relative mb-4 last:mb-0 ${isFirst ? 'pt-0' : ''}`}
          >
            {/* Node on timeline */}
            <div
              className="absolute -left-[18px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full shadow-lg"
              style={{
                backgroundColor: `${color}22`,
                border: `1.5px solid ${color}66`,
                boxShadow: `0 0 8px ${color}33`,
              }}
            >
              <Icon size={9} style={{ color }} />
            </div>

            {/* Event card */}
            <div
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 hover:bg-slate-800/20 transition-colors"
              style={{ borderLeftColor: `${color}44`, borderLeftWidth: 2 }}
            >
              <p className="text-[10px] font-semibold text-slate-200">{event.event}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{event.date}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <div className="text-slate-500">{icon}</div>
      <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
    </div>
  );
}

// status badge config
function StatusBadge({ status }: { status: 'Open' | 'Closed' | 'Pending' }) {
  const colors = {
    Open: 'bg-green-500/15 text-green-400 border-green-500/25',
    Closed: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
    Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  };
  return (
    <span className={`flex-shrink-0 rounded-lg border px-2 py-1 text-[8px] font-bold ${colors[status]}`}>
      {status}
    </span>
  );
}

function EmptyTabState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="h-10 w-10 rounded-full border border-slate-900 flex items-center justify-center">
        <AlertTriangle size={14} className="text-slate-600" />
      </div>
      <p className="text-[11px] text-slate-600">{message}</p>
    </div>
  );
}
