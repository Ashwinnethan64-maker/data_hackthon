import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ENTITY_COLORS, ENTITY_LABELS, EDGE_COLORS } from '../types';
import type { NetworkEntityType, NetworkEdgeRelation } from '../types';

const ENTITY_ENTRIES = Object.entries(ENTITY_COLORS) as [NetworkEntityType, string][];
const EDGE_ENTRIES = Object.entries(EDGE_COLORS) as [NetworkEdgeRelation, string][];

const EDGE_LABELS: Record<NetworkEdgeRelation, string> = {
  Committed: 'Committed',
  Reported: 'Reported',
  InvestigatedBy: 'Investigated By',
  VictimOf: 'Victim Of',
  AssociatedWith: 'Associated With',
  Owns: 'Owns',
  TransferredTo: 'Transferred To',
  LocatedAt: 'Located At',
  AppearedIn: 'Appeared In',
};

export function Legend() {
  const [showEdges, setShowEdges] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 max-w-[200px]">
      {/* Node legend */}
      <div className="rounded-xl border border-white/10 bg-navy/90 backdrop-blur-lg p-3 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          Entity Types
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {ENTITY_ENTRIES.map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full ring-1 ring-white/10"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-slate-300 truncate">
                {ENTITY_LABELS[type]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edge legend (collapsible) */}
      <div className="rounded-xl border border-white/10 bg-navy/90 backdrop-blur-lg shadow-xl overflow-hidden">
        <button
          onClick={() => setShowEdges((p) => !p)}
          className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
        >
          Relationships
          {showEdges ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
        </button>
        {showEdges && (
          <div className="px-3 pb-3 flex flex-col gap-1">
            {EDGE_ENTRIES.map(([rel, color]) => (
              <div key={rel} className="flex items-center gap-1.5">
                <div
                  className="h-px w-5 flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    borderTop: `2px ${rel === 'AssociatedWith' || rel === 'TransferredTo' ? 'dashed' : 'solid'} ${color}`,
                  }}
                />
                <span className="text-[9px] text-slate-300">{EDGE_LABELS[rel]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk indicators */}
      <div className="rounded-xl border border-white/10 bg-navy/90 backdrop-blur-lg p-3 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
          Risk Level
        </p>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Critical', color: '#EF4444' },
            { label: 'High', color: '#F97316' },
            { label: 'Medium', color: '#EAB308' },
            { label: 'Low', color: '#22C55E' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
