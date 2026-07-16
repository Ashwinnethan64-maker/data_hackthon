import { X } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { CaseFilterOptions } from '../types';

interface CaseFiltersProps {
  filters: CaseFilterOptions;
  setFilters: (filters: CaseFilterOptions) => void;
  resetFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const CRIME_CATEGORIES = ['Burglary', 'Robbery', 'Cybercrime', 'Murder', 'Kidnapping', 'Assault', 'Drug Trafficking', 'Rioting', 'Extortion', 'Fraud'];
const DISTRICTS = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi'];

export function CaseFilters({ filters, setFilters, resetFilters, isOpen, onClose }: CaseFiltersProps) {
  if (!isOpen) return null;

  const handleChange = (key: keyof CaseFilterOptions, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="w-80 shrink-0 border border-white/10 bg-slate-900/60 rounded-2xl p-5 space-y-6 max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="font-semibold text-white">Filter Parameters</h3>
          <p className="text-xs text-slate-400 mt-1">Refine investigation records</p>
        </div>
        <button onClick={onClose} className="rounded-xl bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        {/* Crime Category */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Crime Type</span>
          <select
            value={filters.crimeCategory}
            onChange={(e) => handleChange('crimeCategory', e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="">All Categories</option>
            {CRIME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>

        {/* District */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">District</span>
          <select
            value={filters.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="">All Districts</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </label>

        {/* Status */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</span>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Under Review">Under Review</option>
            <option value="Closed">Closed</option>
          </select>
        </label>

        {/* Priority */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Priority</span>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </label>

        {/* IPC / BNS Sections */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">IPC/BNS Sections</span>
          <input
            type="text"
            value={filters.ipcSection}
            onChange={(e) => handleChange('ipcSection', e.target.value)}
            placeholder="e.g. 302, IT Act"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan placeholder:text-slate-600"
          />
        </label>

        {/* Investigating Officer */}
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investigating Officer</span>
          <input
            type="text"
            value={filters.officerName}
            onChange={(e) => handleChange('officerName', e.target.value)}
            placeholder="Name of officer..."
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan placeholder:text-slate-600"
          />
        </label>

        {/* Date Range */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Incident Date Range</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-1.5 text-xs text-white focus:outline-none"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Repeat Offender filter */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Accused Backlog</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleChange('hasRepeatOffender', true)}
              className={`flex-1 py-1.5 rounded-xl border text-xs transition ${
                filters.hasRepeatOffender === true
                  ? 'border-cyan bg-cyan/15 text-cyan'
                  : 'border-white/10 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              Repeat Offender
            </button>
            <button
              onClick={() => handleChange('hasRepeatOffender', null)}
              className={`px-3 py-1.5 rounded-xl border text-xs transition ${
                filters.hasRepeatOffender === null
                  ? 'border-white/20 bg-white/10 text-white'
                  : 'border-white/10 bg-slate-950 text-slate-400'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Victim Demographics */}
        <div className="border-t border-white/5 pt-3 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Victim Details</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[10px] text-slate-400">Gender</span>
              <select
                value={filters.victimGender}
                onChange={(e) => handleChange('victimGender', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
              >
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">Age Range</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.victimAgeMin}
                  onChange={(e) => handleChange('victimAgeMin', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-1 py-1 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.victimAgeMax}
                  onChange={(e) => handleChange('victimAgeMax', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-1 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Accused Demographics */}
        <div className="border-t border-white/5 pt-3 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accused Details</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-[10px] text-slate-400">Gender</span>
              <select
                value={filters.accusedGender}
                onChange={(e) => handleChange('accusedGender', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
              >
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">Age Range</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.accusedAgeMin}
                  onChange={(e) => handleChange('accusedAgeMin', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-1 py-1 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.accusedAgeMax}
                  onChange={(e) => handleChange('accusedAgeMax', e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-1 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 flex gap-3">
        <Button variant="secondary" onClick={resetFilters} className="flex-1 py-2 text-xs">
          Reset All
        </Button>
        <Button onClick={onClose} className="flex-1 py-2 text-xs">
          Apply
        </Button>
      </div>
    </div>
  );
}
