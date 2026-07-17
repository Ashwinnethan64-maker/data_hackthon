import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, ChevronDown, Layers, Flame, Satellite,
  Download, BrainCircuit, Filter, X, Globe
} from 'lucide-react';
import clsx from 'clsx';
import type { MapFilters, CrimeCategory, RiskLevel, IncidentStatus } from '../types';

interface MapToolbarProps {
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  mapType: 'standard' | 'satellite';
  onToggleMapType: () => void;
  onAnalyzeArea: () => void;
  isAnalyzing: boolean;
  totalIncidents: number;
}

const DISTRICTS = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Ballari', 'Davanagere', 'Kalaburagi'];
const CRIME_TYPES: CrimeCategory[] = ['Murder', 'Robbery', 'Burglary', 'Cyber Crime', 'Drug Crime', 'Kidnapping', 'Fraud', 'Violence', 'Traffic Crime', 'Theft', 'Extortion', 'Assault'];
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: IncidentStatus[] = ['Open', 'Closed', 'Pending'];

type ActiveDropdown = 'district' | 'crime' | 'risk' | 'status' | 'date' | null;

function toggleArrayValue<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function FilterPill({ label, active, onRemove }: { label: string; active: boolean; onRemove: () => void }) {
  if (!active) return null;
  return (
    <span className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-police/20 border border-police/40 text-cyan-400 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-white p-0.5 rounded-full"><X className="w-3 h-3" /></button>
    </span>
  );
}

export function MapToolbar({
  filters, onFiltersChange, showHeatmap, onToggleHeatmap, mapType,
  onToggleMapType, onAnalyzeArea, isAnalyzing, totalIncidents
}: MapToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);

  const toggleDropdown = (key: ActiveDropdown) =>
    setActiveDropdown((prev) => (prev === key ? null : key));

  const hasActiveFilters = filters.districts.length > 0 || filters.crimeCategories.length > 0 ||
    filters.riskLevels.length > 0 || filters.statuses.length > 0;

  const clearAll = () => onFiltersChange({ districts: [], crimeCategories: [], riskLevels: [], statuses: [] });

  return (
    <div className="relative z-[1000]">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-950/90 border-b border-slate-700/40 backdrop-blur-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FIR, location, officer…"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all"
          />
          {filters.searchQuery && (
            <button onClick={() => onFiltersChange({ searchQuery: '' })} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-px h-6 bg-slate-700/50" />

        {/* District filter dropdown */}
        {(['district', 'crime', 'risk', 'status'] as const).map((key) => {
          const labelMap = { district: 'District', crime: 'Crime Type', risk: 'Risk Level', status: 'Status' } as const;
          const countMap = {
            district: filters.districts.length,
            crime: filters.crimeCategories.length,
            risk: filters.riskLevels.length,
            status: filters.statuses.length,
          };
          return (
            <button
              key={key}
              onClick={() => toggleDropdown(key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                activeDropdown === key
                  ? 'bg-police/20 border-police/50 text-cyan-400'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {labelMap[key]}
              {countMap[key] > 0 && (
                <span className="bg-cyan-500 text-navy text-xs font-bold px-1.5 rounded-full">{countMap[key]}</span>
              )}
              <ChevronDown className={clsx('w-3 h-3 transition-transform', activeDropdown === key && 'rotate-180')} />
            </button>
          );
        })}

        {/* Date range */}
        <button
          onClick={() => toggleDropdown('date')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
            activeDropdown === 'date'
              ? 'bg-police/20 border-police/50 text-cyan-400'
              : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          Date Range
          <ChevronDown className={clsx('w-3 h-3 transition-transform', activeDropdown === 'date' && 'rotate-180')} />
        </button>

        <div className="w-px h-6 bg-slate-700/50" />

        {/* Toggle buttons */}
        <button
          onClick={onToggleHeatmap}
          title={showHeatmap ? 'Switch to Markers' : 'Enable Heatmap'}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
            showHeatmap
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
          )}
        >
          <Flame className="w-4 h-4" />
          Heatmap
        </button>

        <button
          onClick={onToggleMapType}
          title="Toggle Satellite"
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
            mapType === 'satellite'
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
          )}
        >
          {mapType === 'satellite' ? <Satellite className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
          {mapType === 'satellite' ? 'Satellite' : 'Standard'}
        </button>

        <div className="w-px h-6 bg-slate-700/50" />

        {/* AI Analyze Area */}
        <motion.button
          onClick={onAnalyzeArea}
          disabled={isAnalyzing}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-police to-cyan-500 rounded-lg text-white text-sm font-semibold shadow-lg shadow-police/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-police/50"
        >
          <BrainCircuit className="w-4 h-4" />
          {isAnalyzing ? 'Analyzing…' : 'AI Analyze Area'}
        </motion.button>

        {/* Export */}
        <button title="Export Data" className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all">
          <Download className="w-4 h-4" />
        </button>

        {/* Incident counter */}
        <div className="ml-auto hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-200 font-mono font-semibold">{totalIncidents}</span>
          <span>incidents</span>
        </div>
      </div>

      {/* Active filter pills */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-950/80 border-b border-slate-700/30 overflow-x-auto"
          >
            <span className="text-xs text-slate-500 shrink-0">Active:</span>
            {filters.districts.map((d) => (
              <FilterPill key={d} label={d} active onRemove={() => onFiltersChange({ districts: toggleArrayValue(filters.districts, d) })} />
            ))}
            {filters.crimeCategories.map((c) => (
              <FilterPill key={c} label={c} active onRemove={() => onFiltersChange({ crimeCategories: toggleArrayValue(filters.crimeCategories, c) })} />
            ))}
            {filters.riskLevels.map((r) => (
              <FilterPill key={r} label={r} active onRemove={() => onFiltersChange({ riskLevels: toggleArrayValue(filters.riskLevels, r) })} />
            ))}
            {filters.statuses.map((s) => (
              <FilterPill key={s} label={s} active onRemove={() => onFiltersChange({ statuses: toggleArrayValue(filters.statuses, s) })} />
            ))}
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 ml-2 shrink-0 underline">Clear all</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown panels */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            key={activeDropdown}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 bg-slate-900/95 border border-slate-700/50 shadow-2xl backdrop-blur-xl"
          >
            {activeDropdown === 'district' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filter by District</h4>
                <div className="flex flex-wrap gap-2">
                  {DISTRICTS.map((d) => (
                    <button
                      key={d}
                      onClick={() => onFiltersChange({ districts: toggleArrayValue(filters.districts, d) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm border transition-all',
                        filters.districts.includes(d)
                          ? 'bg-police/25 border-police/50 text-cyan-400 font-medium'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeDropdown === 'crime' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filter by Crime Type</h4>
                <div className="flex flex-wrap gap-2">
                  {CRIME_TYPES.map((c) => (
                    <button
                      key={c}
                      onClick={() => onFiltersChange({ crimeCategories: toggleArrayValue(filters.crimeCategories, c) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm border transition-all',
                        filters.crimeCategories.includes(c)
                          ? 'bg-police/25 border-police/50 text-cyan-400 font-medium'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeDropdown === 'risk' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filter by Risk Level</h4>
                <div className="flex flex-wrap gap-2">
                  {RISK_LEVELS.map((r) => (
                    <button
                      key={r}
                      onClick={() => onFiltersChange({ riskLevels: toggleArrayValue(filters.riskLevels, r) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm border transition-all',
                        filters.riskLevels.includes(r)
                          ? 'bg-police/25 border-police/50 text-cyan-400 font-medium'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeDropdown === 'status' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Filter by Status</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => onFiltersChange({ statuses: toggleArrayValue(filters.statuses, s) })}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-sm border transition-all',
                        filters.statuses.includes(s)
                          ? 'bg-police/25 border-police/50 text-cyan-400 font-medium'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeDropdown === 'date' && (
              <div className="p-4 flex gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">From</label>
                  <input
                    type="date"
                    value={filters.dateRange[0] ?? ''}
                    onChange={(e) => onFiltersChange({ dateRange: [e.target.value || null, filters.dateRange[1]] })}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 outline-none focus:border-cyan/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">To</label>
                  <input
                    type="date"
                    value={filters.dateRange[1] ?? ''}
                    onChange={(e) => onFiltersChange({ dateRange: [filters.dateRange[0], e.target.value || null] })}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 outline-none focus:border-cyan/50"
                  />
                </div>
                {(filters.dateRange[0] || filters.dateRange[1]) && (
                  <button
                    onClick={() => onFiltersChange({ dateRange: [null, null] })}
                    className="self-end px-3 py-1.5 text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-end px-4 pb-3">
              <button onClick={() => setActiveDropdown(null)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
