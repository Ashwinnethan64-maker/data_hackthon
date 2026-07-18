import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit, TrendingUp, MapPin, Users, Shield, Target, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import type { AreaAnalysis } from '../types';

interface AreaAnalysisPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  analysis: AreaAnalysis | null;
  error: string | null;
  onClose: () => void;
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 80 ? 'from-emerald-500 to-cyan-500' : score >= 60 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-600';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">AI Confidence</span>
        <span className="text-sm font-bold text-white font-mono">{score}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className={clsx('h-full rounded-full bg-gradient-to-r', color)}
        />
      </div>
    </div>
  );
}

function RiskScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400';
  const ringColor = score >= 80 ? 'stroke-red-500' : score >= 60 ? 'stroke-orange-500' : score >= 40 ? 'stroke-yellow-500' : 'stroke-green-500';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 shrink-0">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="5" />
          <motion.circle
            cx="32" cy="32" r="28" fill="none"
            strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className={ringColor}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('text-sm font-bold font-mono', color)}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-xs text-slate-400">Area Risk Score</p>
        <p className={clsx('text-sm font-semibold', color)}>
          {score >= 80 ? 'Critical Zone' : score >= 60 ? 'High Risk' : score >= 40 ? 'Moderate' : 'Low Risk'}
        </p>
      </div>
    </div>
  );
}

export function AreaAnalysisPanel({ isOpen, isLoading, analysis, error, onClose }: AreaAnalysisPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-80 shrink-0 bg-slate-950/95 border-l border-slate-700/40 backdrop-blur-xl flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-police to-cyan-500 rounded-lg">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Area Analysis</h2>
                <p className="text-xs text-slate-400">Viewport intelligence summary</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-police animate-spin" />
                  <div className="absolute inset-0 w-10 h-10 rounded-full bg-police/20 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-200 font-medium">Analyzing crime patterns…</p>
                  <p className="text-xs text-slate-400 mt-1">Running AI intelligence models</p>
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {analysis && !isLoading && (
              <div className="p-4 space-y-5">
                {/* Risk Score */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/40">
                  <RiskScoreMeter score={analysis.riskScore} />
                </div>

                {/* Summary */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Shield className="w-3.5 h-3.5" /> Crime Summary
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Most Common Crimes */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Most Common Crimes
                  </h3>
                  <div className="space-y-2">
                    {analysis.mostCommonCrimes.map((c, i) => (
                      <div key={c.category} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-4 font-mono">{i + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-300">{c.category}</span>
                            <span className="text-slate-400 font-mono">{c.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((c.count / (analysis.mostCommonCrimes[0]?.count || 1)) * 100, 100)}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className="h-full bg-gradient-to-r from-police to-cyan-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emerging Trends */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Emerging Trends
                  </h3>
                  <div className="space-y-2">
                    {analysis.emergingTrends.map((t, i) => (
                      <div key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repeat Offenders */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/40">
                  <Users className="w-8 h-8 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Known Repeat Offenders</p>
                    <p className="text-2xl font-bold text-orange-400 font-mono">{analysis.repeatOffenders}</p>
                  </div>
                </div>

                {/* Patrol Strategy */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Recommended Patrol Strategy
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-police/10 border border-police/20 rounded-lg p-3">
                    {analysis.recommendedPatrolStrategy}
                  </p>
                </div>

                {/* Investigation Leads */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5" /> Suggested Leads
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggestedLeads.map((lead, i) => (
                      <div key={i} className={clsx(
                        'p-3 rounded-lg border text-sm',
                        lead.priority === 'High' ? 'bg-red-500/10 border-red-500/20' :
                          lead.priority === 'Medium' ? 'bg-orange-500/10 border-orange-500/20' :
                          'bg-slate-800/40 border-slate-700/30'
                      )}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={clsx(
                            'text-xs font-bold px-1.5 py-0.5 rounded',
                            lead.priority === 'High' ? 'text-red-400 bg-red-500/20' :
                              lead.priority === 'Medium' ? 'text-orange-400 bg-orange-500/20' :
                              'text-slate-400 bg-slate-700/30'
                          )}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="text-slate-300">{lead.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Networks */}
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Shield className="w-3.5 h-3.5" /> Nearby Criminal Networks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.nearbyCriminalNetworks.map((n) => (
                      <span key={n} className="text-xs px-2 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-full">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/40">
                  <ConfidenceBar score={analysis.confidenceScore} />
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      const btn = document.getElementById('accept-save-btn');
                      if (btn) {
                        btn.innerHTML = '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Saved!';
                        btn.classList.add('bg-green-500/20', 'text-green-400', 'border-green-500/30');
                        btn.classList.remove('bg-police/20', 'text-cyan-400', 'border-police/30');
                        setTimeout(onClose, 1000);
                      }
                    }}
                    id="accept-save-btn"
                    className="flex items-center justify-center gap-1.5 py-2 bg-police/20 hover:bg-police/30 text-cyan-400 text-xs font-medium rounded-lg border border-police/30 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Accept & Save
                  </button>
                  <button onClick={onClose} className="flex items-center justify-center gap-1.5 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/50 transition-all">
                    <X className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
