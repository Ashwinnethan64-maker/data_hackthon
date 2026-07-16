import { Calendar, RefreshCcw, Download, BrainCircuit, ChevronDown, Check } from 'lucide-react';
import type { AnalyticsFilters } from '../types';
import { useState } from 'react';
import clsx from 'clsx';

interface AnalyticsToolbarProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void;
  onReset: () => void;
  onTriggerAI: () => void;
  isGeneratingAI: boolean;
  onOpenExport: () => void;
}

const DISTRICTS = [
  'Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi',
  'Shivamogga', 'Tumakuru', 'Ballari', 'Davanagere', 'Kalaburagi'
];

export function AnalyticsToolbar({
  filters,
  onFiltersChange,
  onReset,
  onTriggerAI,
  isGeneratingAI,
  onOpenExport
}: AnalyticsToolbarProps) {
  const [districtDropdown, setDistrictDropdown] = useState(false);

  const toggleDistrict = (district: string) => {
    const next = filters.districts.includes(district)
      ? filters.districts.filter((d) => d !== district)
      : [...filters.districts, district];
    onFiltersChange({ districts: next });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950 border-b border-slate-800 rounded-t-2xl relative z-50">
      <div className="flex flex-wrap items-center gap-3">
        {/* District Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDistrictDropdown(!districtDropdown)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
          >
            <span>Districts ({filters.districts.length})</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {districtDropdown && (
            <div className="absolute left-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-2 flex flex-col gap-1 max-h-60 overflow-y-auto z-[200]">
              {DISTRICTS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDistrict(d)}
                  className={clsx(
                    'w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left rounded transition-colors',
                    filters.districts.includes(d)
                      ? 'bg-police/20 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                >
                  {d}
                  {filters.districts.includes(d) && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={filters.dateRange[0] || ''}
            onChange={(e) => onFiltersChange({ dateRange: [e.target.value || null, filters.dateRange[1]] })}
            className="bg-transparent text-slate-350 outline-none w-24"
          />
          <span className="text-slate-600">-</span>
          <input
            type="date"
            value={filters.dateRange[1] || ''}
            onChange={(e) => onFiltersChange({ dateRange: [filters.dateRange[0], e.target.value || null] })}
            className="bg-transparent text-slate-350 outline-none w-24"
          />
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset filters"
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTriggerAI}
          disabled={isGeneratingAI}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-police to-cyan-500 rounded-lg text-xs font-semibold text-white shadow-lg shadow-police/20 hover:shadow-police/40 transition-all disabled:opacity-60"
        >
          <BrainCircuit className="w-4 h-4" />
          {isGeneratingAI ? 'Generating Insights...' : 'Generate AI Insights'}
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
}
