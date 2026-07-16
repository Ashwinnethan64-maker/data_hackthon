import type { AnalyticsFilters, CrimeCategory } from '../types';
import { Shield, BrainCircuit, Activity, Users, Settings } from 'lucide-react';
import clsx from 'clsx';

interface AnalyticsSidebarProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void;
}

const CRIME_CATEGORIES: CrimeCategory[] = [
  'Murder', 'Robbery', 'Burglary', 'Cyber Crime', 'Drug Crime',
  'Kidnapping', 'Fraud', 'Violence', 'Traffic Crime', 'Theft',
  'Extortion', 'Assault'
];

export function AnalyticsSidebar({ filters, onFiltersChange }: AnalyticsSidebarProps) {
  const toggleCategory = (category: CrimeCategory) => {
    const next = filters.crimeCategories.includes(category)
      ? filters.crimeCategories.filter((c) => c !== category)
      : [...filters.crimeCategories, category];
    onFiltersChange({ crimeCategories: next });
  };

  return (
    <div className="w-64 bg-slate-950/80 border-r border-slate-800 p-4 flex flex-col gap-5 overflow-y-auto">
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Saved Reports</h3>
        <div className="flex flex-col gap-1 mt-2">
          {['Executive Report', 'District Comparison', 'Officer Performance', 'Repeat Offenders'].map((report, i) => (
            <button
              key={report}
              className={clsx(
                'w-full px-3 py-2 text-xs text-left rounded-lg transition-colors border',
                i === 0
                  ? 'bg-police/15 border-police/30 text-cyan-400 font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              )}
            >
              {report}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Demographic Focus</h3>
        
        {/* Victim Gender */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wide block">Victim Gender</label>
          <select
            value={filters.victimGender || 'All'}
            onChange={(e) => onFiltersChange({ victimGender: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Accused Gender */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase tracking-wide block">Accused Gender</label>
          <select
            value={filters.accusedGender || 'All'}
            onChange={(e) => onFiltersChange({ accusedGender: e.target.value as any })}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-cyan-500/50"
          >
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-1 flex-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Crime Categories</h3>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
          {CRIME_CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer py-1 group">
              <input
                type="checkbox"
                checked={filters.crimeCategories.includes(c)}
                onChange={() => toggleCategory(c)}
                className="w-3.5 h-3.5 rounded accent-cyan-400"
              />
              <span className={clsx('text-xs transition-colors', filters.crimeCategories.includes(c) ? 'text-cyan-400 font-semibold' : 'text-slate-400 group-hover:text-slate-200')}>
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
