import { motion } from 'framer-motion';
import { Brain, Star, CheckCircle, AlertCircle } from 'lucide-react';
import type { AIInsight } from '../types';

interface InsightCardProps {
  insight: AIInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col gap-3"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-200">AI Investigator Insight</h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">
          Conf: {insight.confidenceScore}%
        </span>
      </div>

      <p className="text-sm text-slate-300 font-medium">{insight.summary}</p>
      <p className="text-xs text-slate-400 leading-relaxed">{insight.supportingEvidence}</p>

      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-xs">
        <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Suggested Action</span>
        <span className="text-slate-300">{insight.suggestedAction}</span>
      </div>

      {insight.relatedCases.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-500 mr-1">Related:</span>
          {insight.relatedCases.map((rc) => (
            <span key={rc} className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700/50 rounded font-mono text-slate-300">
              {rc}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
