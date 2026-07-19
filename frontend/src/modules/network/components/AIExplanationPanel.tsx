import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, TrendingUp, Users, Link, FileSearch,
  ChevronRight, Lightbulb, Target, RefreshCw, Brain,
  Shield, Zap,
} from 'lucide-react';
import type { AIExplanation, InvestigationLead } from '../types';

interface AIExplanationPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  explanation: AIExplanation | null;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

const PRIORITY_CONFIG = {
  High:   { bg: 'rgba(239,68,68,0.08)',   border: '#EF444433', text: '#F87171', icon: '#EF4444', label: 'High Priority' },
  Medium: { bg: 'rgba(234,179,8,0.08)',   border: '#EAB30833', text: '#FDE047', icon: '#EAB308', label: 'Medium Priority' },
  Low:    { bg: 'rgba(59,130,246,0.08)',  border: '#3B82F633', text: '#93C5FD', icon: '#3B82F6', label: 'Low Priority' },
};

function LeadCard({ lead, index }: { lead: InvestigationLead; index: number }) {
  const cfg = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.Low;
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border p-3.5"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Target size={11} style={{ color: cfg.icon }} />
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: cfg.text }}>
          {cfg.label}
        </span>
      </div>
      <p className="text-[11px] text-slate-300 leading-relaxed">{lead.description}</p>
      {lead.entities && lead.entities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.entities.map((e) => (
            <span
              key={e}
              className="rounded px-1.5 py-0.5 text-[8px] font-semibold text-slate-400 bg-white/5 border border-white/8"
            >
              {e}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Section({
  icon,
  title,
  accentColor = '#8B5CF6',
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  accentColor?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accentColor}22` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <h3 className="text-[9px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5 rounded-lg bg-white/2 border border-white/5 px-3 py-2.5">
          <ChevronRight size={10} className="flex-shrink-0 mt-0.5" style={{ color }} />
          <p className="text-[11px] text-slate-300 leading-relaxed">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function AIExplanationPanel({
  isOpen,
  isLoading,
  explanation,
  error,
  onClose,
  onRefresh,
}: AIExplanationPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute right-0 top-0 bottom-0 z-50 w-[440px] flex flex-col border-l border-purple-500/15 shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(10,8,25,0.99) 0%, rgba(20,10,45,0.99) 100%)',
            }}
          >
            {/* Decorative top glow */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)' }}
            />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
            />

            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-white/6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)',
                      border: '1px solid rgba(139,92,246,0.35)',
                      boxShadow: '0 0 16px rgba(139,92,246,0.2)',
                    }}
                  >
                    <Brain size={16} className="text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">AI Network Analysis</h2>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">
                      AI-CIOS Intelligence Engine
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onRefresh}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/6 hover:text-slate-200 transition-colors"
                    title="Re-run analysis"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white/6 hover:text-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Loading State ── */}
            {isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-spin border-t-purple-500" />
                  <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-spin border-b-indigo-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <Brain size={18} className="text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-200">Analyzing Network…</p>
                  <p className="text-[11px] text-slate-500 mt-1">Mapping relationships & scoring risk</p>
                </div>
                <div className="w-full flex flex-col gap-2">
                  {['Parsing entities & edges', 'Detecting hidden links', 'Scoring risk patterns', 'Generating leads'].map((step, i) => (
                    <div key={step} className="flex items-center gap-2.5 rounded-lg bg-white/3 border border-white/5 px-3 py-2">
                      <div
                        className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse flex-shrink-0"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                      <span className="text-[11px] text-slate-400">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Error State ── */}
            {error && !isLoading && (
              <div className="flex flex-1 items-center justify-center px-5">
                <div className="w-full rounded-2xl border border-red-500/25 bg-red-500/8 p-5 text-center">
                  <AlertTriangle size={20} className="text-red-400 mx-auto mb-3" />
                  <p className="text-sm text-red-300">{error}</p>
                  <button
                    onClick={onRefresh}
                    className="mt-4 rounded-xl bg-red-500/15 border border-red-500/25 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            )}

            {/* ── Content ── */}
            {!isLoading && !error && explanation && (
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

                {/* Confidence score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 rounded-2xl border border-purple-500/20 p-4"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.05) 100%)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Zap size={11} className="text-purple-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                        Analysis Confidence
                      </span>
                    </div>
                    <span className="text-2xl font-black text-purple-200 tabular-nums">
                      {explanation.confidenceScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-purple-500/15">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${explanation.confidenceScore}%` }}
                      transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #8B5CF6, #6366F1)' }}
                    />
                  </div>
                </motion.div>

                {/* Summary */}
                <Section icon={<FileSearch size={11} />} title="Network Summary" accentColor="#06B6D4" delay={0.05}>
                  <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                    <p className="text-[11px] leading-relaxed text-slate-300">{explanation.summary}</p>
                  </div>
                </Section>

                {/* Key Individuals */}
                {explanation.keyIndividuals.length > 0 && (
                  <Section icon={<Users size={11} />} title="Key Individuals" accentColor="#EF4444" delay={0.1}>
                    <div className="flex flex-col gap-1.5">
                      {explanation.keyIndividuals.map((person, i) => (
                        <div
                          key={person.name}
                          className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-3 py-2.5"
                        >
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 border border-red-500/25 text-[9px] font-black text-red-400">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-slate-200 truncate">{person.name}</p>
                            <p className="text-[9px] text-slate-500">{person.role}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-[11px] font-black text-red-400">{person.centrality}</p>
                            <p className="text-[8px] text-slate-600">cases</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Hidden Relationships */}
                {explanation.hiddenRelationships.length > 0 && (
                  <Section icon={<Link size={11} />} title="Hidden Relationships" accentColor="#8B5CF6" delay={0.15}>
                    <BulletList items={explanation.hiddenRelationships} color="#8B5CF6" />
                  </Section>
                )}

                {/* Repeat Patterns */}
                {explanation.repeatPatterns.length > 0 && (
                  <Section icon={<TrendingUp size={11} />} title="Repeat Patterns" accentColor="#EAB308" delay={0.2}>
                    <BulletList items={explanation.repeatPatterns} color="#EAB308" />
                  </Section>
                )}

                {/* Suspicious Connections */}
                {explanation.suspiciousConnections.length > 0 && (
                  <Section icon={<AlertTriangle size={11} />} title="Suspicious Connections" accentColor="#F97316" delay={0.25}>
                    <div className="flex flex-col gap-2">
                      {explanation.suspiciousConnections.map((conn, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 rounded-xl border border-orange-500/20 bg-orange-500/6 px-3 py-2.5"
                        >
                          <AlertTriangle size={10} className="flex-shrink-0 mt-0.5 text-orange-400" />
                          <p className="text-[11px] text-orange-200 leading-relaxed">{conn}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Evidence */}
                {explanation.evidence.length > 0 && (
                  <Section icon={<Shield size={11} />} title="Evidence Sources" accentColor="#22C55E" delay={0.3}>
                    <div className="flex flex-col gap-1.5">
                      {explanation.evidence.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                          <div className="h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                          {ev}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Investigation Leads */}
                {explanation.investigationLeads.length > 0 && (
                  <Section icon={<Lightbulb size={11} />} title="Investigation Leads" accentColor="#F59E0B" delay={0.35}>
                    <div className="flex flex-col gap-2">
                      {explanation.investigationLeads.map((lead, i) => (
                        <LeadCard key={i} lead={lead} index={i} />
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-white/6 px-5 py-3">
              <p className="text-[9px] text-slate-600 text-center leading-relaxed">
                AI analysis is for investigative reference only. Verify independently before taking action.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
