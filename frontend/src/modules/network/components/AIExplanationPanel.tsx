import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, TrendingUp, Users, Link, FileSearch,
  ChevronRight, Lightbulb, Target, RefreshCw, Brain,
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

const PRIORITY_COLORS = {
  High: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  Medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Low: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
};

function LeadCard({ lead }: { lead: InvestigationLead }) {
  const colors = PRIORITY_COLORS[lead.priority];
  return (
    <div className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-2">
        <Target size={12} className={`mt-0.5 flex-shrink-0 ${colors.text}`} />
        <div>
          <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${colors.text}`}>
            {lead.priority} Priority
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed">{lead.description}</p>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="text-purple-400">{icon}</div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {title}
        </h3>
      </div>
      {children}
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
            className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 bottom-0 z-50 w-[420px] flex flex-col border-l border-purple-500/20 bg-slate-950/98 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(8,17,32,0.98) 0%, rgba(30,15,50,0.98) 100%)' }}
          >
            {/* Header */}
            <div className="flex-shrink-0 border-b border-purple-500/20 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20">
                    <Brain size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI Network Analysis</h2>
                    <p className="text-[10px] text-slate-500">Powered by AI-CIOS Intelligence Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onRefresh}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                    title="Refresh Analysis"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-purple-500/30 animate-spin border-t-purple-500" />
                    <Brain size={18} className="absolute inset-0 m-auto text-purple-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-300">Analyzing Network…</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mapping relationships, detecting patterns
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    {['Mapping 300+ nodes', 'Detecting hidden links', 'Scoring risk patterns', 'Generating leads'].map(
                      (step, i) => (
                        <div key={step} className="flex items-center gap-2 text-xs text-slate-500">
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms` }}
                          />
                          {step}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {!isLoading && !error && explanation && (
                <div>
                  {/* Confidence score */}
                  <div className="mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                        AI Confidence Score
                      </span>
                      <span className="text-xl font-black text-purple-300">
                        {explanation.confidenceScore}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-purple-500/20">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${explanation.confidenceScore}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <Section icon={<FileSearch size={13} />} title="Network Summary">
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {explanation.summary}
                    </p>
                  </Section>

                  {/* Key Individuals */}
                  <Section icon={<Users size={13} />} title="Key Individuals">
                    <div className="flex flex-col gap-1.5">
                      {explanation.keyIndividuals.map((person, i) => (
                        <div
                          key={person.name}
                          className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
                        >
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold text-red-400">
                            #{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-slate-200 truncate">
                              {person.name}
                            </p>
                            <p className="text-[9px] text-slate-500">{person.role}</p>
                          </div>
                          <div className="text-[10px] font-bold text-red-400">
                            {person.centrality}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Hidden Relationships */}
                  <Section icon={<Link size={13} />} title="Hidden Relationships">
                    <div className="flex flex-col gap-2">
                      {explanation.hiddenRelationships.map((rel, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight size={10} className="mt-1 flex-shrink-0 text-cyan" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">{rel}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Repeat Patterns */}
                  <Section icon={<TrendingUp size={13} />} title="Repeat Patterns">
                    <div className="flex flex-col gap-2">
                      {explanation.repeatPatterns.map((pat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">{pat}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Suspicious Connections */}
                  <Section icon={<AlertTriangle size={13} />} title="Suspicious Connections">
                    <div className="flex flex-col gap-2">
                      {explanation.suspiciousConnections.map((conn, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2"
                        >
                          <p className="text-[11px] text-orange-200 leading-relaxed">{conn}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Evidence */}
                  <Section icon={<FileSearch size={13} />} title="Key Evidence">
                    <div className="flex flex-col gap-1.5">
                      {explanation.evidence.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                          <span className="mt-0.5 flex-shrink-0 text-cyan">▸</span>
                          {ev}
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Investigation Leads */}
                  <Section icon={<Lightbulb size={13} />} title="Investigation Leads">
                    <div className="flex flex-col gap-2">
                      {explanation.investigationLeads.map((lead, i) => (
                        <LeadCard key={i} lead={lead} />
                      ))}
                    </div>
                  </Section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-purple-500/20 px-5 py-3">
              <p className="text-[9px] text-slate-600 text-center">
                AI analysis is for investigative reference only. Verify before action.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
