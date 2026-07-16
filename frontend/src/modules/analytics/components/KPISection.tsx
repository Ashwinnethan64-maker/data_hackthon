import { motion } from 'framer-motion';
import { Shield, Clock, ShieldAlert, FileText, CheckCircle2, AlertCircle, Users, Activity } from 'lucide-react';
import type { KPIData } from '../types';

interface KPISectionProps {
  kpis: KPIData;
}

export function KPISection({ kpis }: KPISectionProps) {
  const cards = [
    { label: 'Total FIRs', value: kpis.totalFirs, icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Active Cases', value: kpis.activeCases, icon: Shield, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { label: 'Solved Cases', value: kpis.solvedCases, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { label: 'Pending Cases', value: kpis.pendingCases, icon: AlertCircle, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Repeat Offenders', value: kpis.repeatOffenders, icon: Users, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { label: 'Risk Index', value: kpis.riskIndex, icon: ShieldAlert, suffix: '/100', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { label: 'Avg Investigation Time', value: kpis.avgInvestigationTime, suffix: ' Days', icon: Clock, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Trend Rate', value: kpis.trendPercentage, suffix: '%', icon: Activity, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`p-4 rounded-xl border backdrop-blur-xl bg-slate-900/60 flex items-center justify-between ${card.color}`}
          >
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">{card.label}</span>
              <span className="text-2xl font-bold font-mono text-white block">
                {card.value}
                {card.suffix}
              </span>
            </div>
            <Icon className="w-8 h-8 opacity-80" />
          </motion.div>
        );
      })}
    </div>
  );
}
