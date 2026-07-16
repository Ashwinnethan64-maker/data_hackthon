import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import type { NetworkNode, NetworkEntityType } from '../types';
import { ENTITY_COLORS, ENTITY_LABELS } from '../types';
import {
  FileText, User, UserCheck, Eye, Shield, Building2,
  Landmark, CreditCard, Phone, Car, MapPin, Map,
  AlertTriangle, Scale,
} from 'lucide-react';

const ICONS: Record<NetworkEntityType, React.ElementType> = {
  FIR: FileText, Accused: User, Victim: UserCheck, Witness: Eye,
  Officer: Shield, PoliceStation: Building2, Court: Landmark,
  BankAccount: CreditCard, Phone: Phone, Vehicle: Car,
  Address: MapPin, District: Map, CrimeCategory: AlertTriangle, IPCSection: Scale,
};

interface SearchPanelProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: NetworkNode[];
  onSelectResult: (nodeId: string) => void;
}

export function SearchPanel({
  query,
  onQueryChange,
  results,
  onSelectResult,
}: SearchPanelProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      onSelectResult(id);
      onQueryChange('');
    },
    [onSelectResult, onQueryChange],
  );

  return (
    <div className="relative">
      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
        style={{
          borderColor: isFocused ? 'rgba(6, 182, 212, 0.5)' : 'rgba(148, 163, 184, 0.15)',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
        }}
      >
        <Search size={13} className="flex-shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search entities…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
        />
        {query && (
          <button onClick={() => onQueryChange('')} className="text-slate-500 hover:text-slate-300">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {query && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          {results.map((node) => {
            const color = ENTITY_COLORS[node.data.entityType];
            const Icon = ICONS[node.data.entityType];
            return (
              <button
                key={node.id}
                onMouseDown={() => handleSelect(node.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <Icon size={11} style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-100 truncate">
                    {node.data.label}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {ENTITY_LABELS[node.data.entityType]}
                    {node.data.district && ` · ${node.data.district}`}
                  </p>
                </div>
                {node.data.riskScore > 0 && (
                  <div
                    className="flex-shrink-0 rounded px-1 py-0.5 text-[9px] font-bold"
                    style={{
                      backgroundColor: `${color}22`,
                      color,
                    }}
                  >
                    {node.data.riskScore}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-white/10 bg-slate-950/95 px-3 py-4 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xs text-slate-500">No entities found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
