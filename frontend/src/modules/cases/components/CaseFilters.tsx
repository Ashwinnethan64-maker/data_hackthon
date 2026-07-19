import { X, ChevronDown } from 'lucide-react';
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
  const handleChange = (key: keyof CaseFilterOptions, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[1040] bg-navy/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Filters Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-[1050] w-80 max-w-[85vw] border-r border-white/10 bg-slate-900/95 p-5 space-y-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:block lg:shrink-0 lg:rounded-2xl lg:border lg:bg-slate-900/60 lg:max-h-[85vh] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-semibold text-white tracking-wide">Filter Parameters</h3>
            <p className="text-[11px] text-slate-400 mt-1">Refine investigation records</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl bg-white/5 p-1.5 text-slate-400 hover:bg-cyan/10 hover:text-cyan transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Crime Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Crime Type</label>
            <div className="relative">
              <select
                value={filters.crimeCategory}
                onChange={(e) => handleChange('crimeCategory', e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              >
                <option value="" className="bg-slate-950 text-white">All Categories</option>
                {CRIME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-950 text-white">{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">District</label>
            <div className="relative">
              <select
                value={filters.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              >
                <option value="" className="bg-slate-950 text-white">All Districts</option>
                {DISTRICTS.map((dist) => (
                  <option key={dist} value={dist} className="bg-slate-950 text-white">{dist}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Status</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              >
                <option value="" className="bg-slate-950 text-white">All Statuses</option>
                <option value="Open" className="bg-slate-950 text-white">Open</option>
                <option value="Under Investigation" className="bg-slate-950 text-white">Under Investigation</option>
                <option value="Under Review" className="bg-slate-950 text-white">Under Review</option>
                <option value="Closed" className="bg-slate-950 text-white">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Priority</label>
            <div className="relative">
              <select
                value={filters.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              >
                <option value="" className="bg-slate-950 text-white">All Priorities</option>
                <option value="Low" className="bg-slate-950 text-white">Low</option>
                <option value="Medium" className="bg-slate-950 text-white">Medium</option>
                <option value="High" className="bg-slate-950 text-white">High</option>
                <option value="Critical" className="bg-slate-950 text-white">Critical</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>

          {/* IPC / BNS Sections */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">IPC/BNS Sections</label>
            <input
              type="text"
              value={filters.ipcSection}
              onChange={(e) => handleChange('ipcSection', e.target.value)}
              placeholder="e.g. 302, IT Act"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
            />
          </div>

          {/* Investigating Officer */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Investigating Officer</label>
            <input
              type="text"
              value={filters.officerName}
              onChange={(e) => handleChange('officerName', e.target.value)}
              placeholder="Name of officer..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Incident Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
              />
            </div>
          </div>

          {/* Repeat Offender filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-cyan/70">Accused Backlog</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleChange('hasRepeatOffender', true)}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition duration-200 ${
                  filters.hasRepeatOffender === true
                    ? 'border-cyan bg-cyan/15 text-cyan'
                    : 'border-white/10 bg-slate-950/60 text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                Repeat Offender
              </button>
              <button
                onClick={() => handleChange('hasRepeatOffender', null)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition duration-200 ${
                  filters.hasRepeatOffender === null
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-white/10 bg-slate-950/60 text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Victim Demographics */}
          <div className="border-t border-white/5 pt-3 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Victim Details</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">Gender</span>
                <div className="relative">
                  <select
                    value={filters.victimGender}
                    onChange={(e) => handleChange('victimGender', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2 py-1 pr-7 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
                  >
                    <option value="" className="bg-slate-950 text-white">Any</option>
                    <option value="Male" className="bg-slate-950 text-white">Male</option>
                    <option value="Female" className="bg-slate-950 text-white">Female</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">Age Range</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.victimAgeMin}
                    onChange={(e) => handleChange('victimAgeMin', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.victimAgeMax}
                    onChange={(e) => handleChange('victimAgeMax', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accused Demographics */}
          <div className="border-t border-white/5 pt-3 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accused Details</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">Gender</span>
                <div className="relative">
                  <select
                    value={filters.accusedGender}
                    onChange={(e) => handleChange('accusedGender', e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2 py-1 pr-7 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200"
                  >
                    <option value="" className="bg-slate-950 text-white">Any</option>
                    <option value="Male" className="bg-slate-950 text-white">Male</option>
                    <option value="Female" className="bg-slate-950 text-white">Female</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold block">Age Range</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.accusedAgeMin}
                    onChange={(e) => handleChange('accusedAgeMin', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.accusedAgeMax}
                    onChange={(e) => handleChange('accusedAgeMax', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-900/50 hover:border-cyan/40 px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/30 focus:border-cyan transition duration-200 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex gap-3">
          <Button variant="secondary" onClick={resetFilters} className="flex-1 py-2.5 text-xs font-semibold">
            Reset All
          </Button>
          <Button onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold shadow-lg shadow-cyan/10">
            Apply
          </Button>
        </div>
      </div>
    </>
  );
}
