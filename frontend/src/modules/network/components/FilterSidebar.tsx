import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, X, RotateCcw } from 'lucide-react';
import type { NetworkFilterOptions, NetworkEntityType, RiskLevel } from '../types';
import { DEFAULT_FILTERS, ENTITY_LABELS } from '../types';
import {
  AVAILABLE_DISTRICTS,
  AVAILABLE_CRIME_TYPES,
  AVAILABLE_GANGS,
} from '../services/networkService';
import { SearchPanel } from './SearchPanel';
import type { NetworkNode } from '../types';

const ENTITY_TYPES: NetworkEntityType[] = [
  'FIR', 'Accused', 'Victim', 'Witness', 'Officer',
  'PoliceStation', 'Court', 'BankAccount', 'Phone', 'Vehicle',
  'Address', 'District', 'CrimeCategory', 'IPCSection',
];

const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];

interface SavedNetworkItem {
  id: string;
  name: string;
  description: string;
  nodeCount: number;
  createdAt: string;
  tags: string[];
}

interface FilterSidebarProps {
  filters: NetworkFilterOptions;
  onApply: (filters: NetworkFilterOptions) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: NetworkNode[];
  onSelectSearchResult: (id: string) => void;
  savedNetworks: SavedNetworkItem[];
  recentNetworks: SavedNetworkItem[];
  nodeCount: number;
  edgeCount: number;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
      >
        {title}
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar({
  filters,
  onApply,
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
  savedNetworks,
  recentNetworks,
  nodeCount,
  edgeCount,
}: FilterSidebarProps) {
  const [draft, setDraft] = useState<NetworkFilterOptions>(filters);

  function toggleEntityType(type: NetworkEntityType) {
    setDraft((prev) => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(type)
        ? prev.entityTypes.filter((t) => t !== type)
        : [...prev.entityTypes, type],
    }));
  }

  function toggleDistrict(d: string) {
    setDraft((prev) => ({
      ...prev,
      districts: prev.districts.includes(d)
        ? prev.districts.filter((x) => x !== d)
        : [...prev.districts, d],
    }));
  }

  function toggleCrimeType(ct: string) {
    setDraft((prev) => ({
      ...prev,
      crimeTypes: prev.crimeTypes.includes(ct)
        ? prev.crimeTypes.filter((x) => x !== ct)
        : [...prev.crimeTypes, ct],
    }));
  }

  function handleReset() {
    setDraft(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  }

  const hasActiveFilters =
    draft.entityTypes.length > 0 ||
    draft.districts.length > 0 ||
    draft.crimeTypes.length > 0 ||
    draft.riskLevel !== '' ||
    draft.gang !== '' ||
    draft.repeatOffenderOnly;

  return (
    <aside className="flex h-full flex-col overflow-hidden border-r border-white/8 bg-navy/80 backdrop-blur-xl">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/8 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-cyan" />
            <span className="text-xs font-bold text-slate-200">Network Explorer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
              {nodeCount}N · {edgeCount}E
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-2.5 relative">
          <SearchPanel
            query={searchQuery}
            onQueryChange={onSearchChange}
            results={searchResults}
            onSelectResult={onSelectSearchResult}
          />
        </div>
      </div>

      {/* Scrollable filters */}
      <div className="flex-1 overflow-y-auto px-4 py-1 scrollbar-thin">
        {/* Saved Networks */}
        <CollapsibleSection title="Saved Networks" defaultOpen={false}>
          <div className="flex flex-col gap-1.5">
            {savedNetworks.map((net) => (
              <button
                key={net.id}
                className="w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-left hover:bg-white/8 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-200">{net.name}</p>
                <p className="text-[9px] text-slate-500">{net.nodeCount} nodes · {net.createdAt}</p>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Recent Networks */}
        <CollapsibleSection title="Recent" defaultOpen={false}>
          <div className="flex flex-col gap-1.5">
            {recentNetworks.map((net) => (
              <button
                key={net.id}
                className="w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-left hover:bg-white/8 transition-colors"
              >
                <p className="text-[11px] font-semibold text-slate-200">{net.name}</p>
                <p className="text-[9px] text-slate-500">{net.nodeCount} nodes · {net.createdAt}</p>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Entity Types */}
        <CollapsibleSection title="Entity Types">
          <div className="flex flex-col gap-1">
            {ENTITY_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={draft.entityTypes.includes(type)}
                  onChange={() => toggleEntityType(type)}
                  className="h-3 w-3 rounded accent-cyan"
                />
                <span className="text-[11px] text-slate-300">{ENTITY_LABELS[type]}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Crime Types */}
        <CollapsibleSection title="Crime Type">
          <div className="flex flex-col gap-1">
            {AVAILABLE_CRIME_TYPES.map((ct) => (
              <label
                key={ct}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={draft.crimeTypes.includes(ct)}
                  onChange={() => toggleCrimeType(ct)}
                  className="h-3 w-3 rounded accent-cyan"
                />
                <span className="text-[11px] text-slate-300">{ct}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Districts */}
        <CollapsibleSection title="District">
          <div className="flex flex-col gap-1">
            {AVAILABLE_DISTRICTS.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={draft.districts.includes(d)}
                  onChange={() => toggleDistrict(d)}
                  className="h-3 w-3 rounded accent-cyan"
                />
                <span className="text-[11px] text-slate-300">{d}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Risk Level */}
        <CollapsibleSection title="Risk Level">
          <div className="flex flex-col gap-1">
            {(['', ...RISK_LEVELS] as (RiskLevel | '')[]).map((level) => (
              <label
                key={level || 'all'}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <input
                  type="radio"
                  name="riskLevel"
                  checked={draft.riskLevel === level}
                  onChange={() => setDraft((prev) => ({ ...prev, riskLevel: level }))}
                  className="h-3 w-3 accent-cyan"
                />
                <span className="text-[11px] text-slate-300">{level || 'All'}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Gang */}
        <CollapsibleSection title="Gang / Network" defaultOpen={false}>
          <select
            value={draft.gang}
            onChange={(e) => setDraft((prev) => ({ ...prev, gang: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-200 outline-none focus:border-cyan/50"
          >
            <option value="">All Gangs</option>
            {AVAILABLE_GANGS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </CollapsibleSection>

        {/* Repeat Offender */}
        <CollapsibleSection title="Offender Profile" defaultOpen={false}>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors">
            <div
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  repeatOffenderOnly: !prev.repeatOffenderOnly,
                }))
              }
              className={`relative flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
                draft.repeatOffenderOnly ? 'bg-cyan' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  draft.repeatOffenderOnly ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-[11px] text-slate-300">Repeat Offenders Only</span>
          </label>
        </CollapsibleSection>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 border-t border-white/8 px-4 py-3 flex gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-[11px] text-slate-300 hover:bg-white/5 transition-colors"
        >
          <RotateCcw size={11} />
          Reset
        </button>
        <button
          onClick={() => onApply(draft)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-police px-3 py-2 text-[11px] font-semibold text-white shadow-lg shadow-police/25 hover:bg-police/90 transition-colors"
        >
          <Filter size={11} />
          Apply
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold">
              {draft.entityTypes.length + draft.districts.length + draft.crimeTypes.length + (draft.riskLevel ? 1 : 0) + (draft.gang ? 1 : 0) + (draft.repeatOffenderOnly ? 1 : 0)}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button onClick={handleReset} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
