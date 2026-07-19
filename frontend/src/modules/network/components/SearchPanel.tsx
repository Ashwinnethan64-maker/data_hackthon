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

const RISK_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#EAB308',
  Low: '#22C55E',
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
    <div className="relative w-full">
      {/* Input wrapper */}
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all duration-200"
        style={{
          borderColor: isFocused ? 'rgba(6, 182, 212, 0.45)' : 'rgba(148, 163, 184, 0.12)',
          backgroundColor: isFocused ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.6)',
          boxShadow: isFocused ? '0 0 14px rgba(6, 182, 212, 0.15)' : 'none',
        }}
      >
        <Search size={13} className="flex-shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search entities (e.g. Accused, Station, FIR)..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 180)}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none overflow-hidden text-ellipsis"
        />
        {query && (
          <button 
            onClick={() => onQueryChange('')} 
            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-md hover:bg-slate-800/40"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {query && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-navy/95 shadow-2xl backdrop-blur-xl scrollbar-thin">
          {results.map((node) => {
            const color = ENTITY_COLORS[node.data.entityType] ?? '#94A3B8';
            const Icon = ICONS[node.data.entityType] ?? FileText;
            const riskColor = RISK_COLORS[node.data.riskLevel] ?? '#94A3B8';
            
            return (
              <button
                key={node.id}
                onMouseDown={() => handleSelect(node.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-800/30 transition-colors border-b border-slate-900 last:border-0"
              >
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ 
                    backgroundColor: `${color}15`,
                    border: `1.5px solid ${color}35`
                  }}
                >
                  <Icon size={11} style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {node.data.label}
                  </p>
                  <p className="text-[9px] text-slate-500 leading-none mt-0.5 uppercase tracking-wide">
                    {ENTITY_LABELS[node.data.entityType]}
                    {node.data.district && ` · ${node.data.district}`}
                  </p>
                </div>
                {node.data.riskScore > 0 && (
                  <div
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black"
                    style={{
                      backgroundColor: `${riskColor}15`,
                      border: `1px solid ${riskColor}30`,
                      color: riskColor,
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
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl border border-slate-800 bg-navy/95 px-3 py-4 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-xs text-slate-500">No entities found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
