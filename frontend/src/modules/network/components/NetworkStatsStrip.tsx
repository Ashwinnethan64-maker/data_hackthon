import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, AlertTriangle, User, FileText, Map, GitBranch, Activity } from 'lucide-react';
import type { NetworkNode, NetworkEdge } from '../types';

interface NetworkStatsStripProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export function NetworkStatsStrip({ nodes, edges }: NetworkStatsStripProps) {
  const stats = useMemo(() => {
    const entityNodes = nodes.filter(n => n.type === 'entityNode');
    const criticalCount = entityNodes.filter(n => n.data.riskLevel === 'Critical').length;
    const accusedCount = entityNodes.filter(n => n.data.entityType === 'Accused').length;
    const firCount = entityNodes.filter(n => n.data.entityType === 'FIR').length;
    const districtIds = new Set(
      entityNodes.filter(n => n.data.district).map(n => n.data.district)
    );

    return [
      { label: 'Entities',      value: entityNodes.length,  icon: Network,       color: '#06B6D4' },
      { label: 'Connections',   value: edges.length,         icon: GitBranch,     color: '#8B5CF6' },
      { label: 'Critical Risk', value: criticalCount,        icon: AlertTriangle, color: '#EF4444', urgent: criticalCount > 0 },
      { label: 'Accused',       value: accusedCount,         icon: User,          color: '#F97316' },
      { label: 'Active FIRs',   value: firCount,             icon: FileText,      color: '#3B82F6' },
      { label: 'Districts',     value: districtIds.size,     icon: Map,           color: '#22C55E' },
    ];
  }, [nodes, edges]);

  return (
    <div
      className="flex-shrink-0 flex items-center border-b border-slate-900"
      style={{
        background: 'linear-gradient(90deg, rgba(6,182,212,0.03) 0%, rgba(8,17,32,0.8) 40%, rgba(8,17,32,0.8) 60%, rgba(139,92,246,0.03) 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Section label */}
      <div className="flex items-center gap-1.5 pl-4 pr-3 border-r border-slate-900 self-stretch py-2">
        <Activity size={10} className="text-slate-600" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap">
          Network Intel
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-0 flex-1 overflow-x-auto">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2.5 px-5 py-2.5 border-r border-slate-900 last:border-0 group hover:bg-slate-800/20 transition-colors duration-150 cursor-default flex-shrink-0"
            >
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110"
                style={{
                  backgroundColor: `${stat.color}18`,
                  border: `1px solid ${stat.color}25`,
                }}
              >
                <Icon size={11} style={{ color: stat.color }} />
              </div>
              <div>
                <p
                  className="text-sm font-black leading-none tabular-nums"
                  style={{
                    color: stat.color,
                    textShadow: stat.urgent ? `0 0 12px ${stat.color}` : undefined,
                  }}
                >
                  {stat.value}
                  {stat.urgent && (
                    <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse align-middle" />
                  )}
                </p>
                <p className="text-[9px] font-semibold text-slate-600 leading-none mt-0.5 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 pl-4 pr-4 border-l border-slate-900 self-stretch py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap hidden lg:block">
          Live
        </span>
      </div>
    </div>
  );
}
