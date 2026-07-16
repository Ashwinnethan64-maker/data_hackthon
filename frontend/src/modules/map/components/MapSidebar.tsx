import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Shield, AlertTriangle, Users, Activity, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';
import type { MapFilters, CrimeCategory, RiskLevel, IncidentStatus } from '../types';

interface MapSidebarProps {
  filters: MapFilters;
  onFiltersChange: (filters: Partial<MapFilters>) => void;
  incidentCount: number;
}

const DISTRICTS = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Ballari', 'Davanagere', 'Kalaburagi'];
const CRIME_CATEGORIES: CrimeCategory[] = ['Murder', 'Robbery', 'Burglary', 'Cyber Crime', 'Drug Crime', 'Kidnapping', 'Fraud', 'Violence', 'Traffic Crime', 'Theft', 'Extortion', 'Assault'];
const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: IncidentStatus[] = ['Open', 'Pending', 'Closed'];

const RISK_COLORS: Record<RiskLevel, string> = {
  Critical: 'bg-red-500',
  High: 'bg-orange-500',
  Medium: 'bg-yellow-500',
  Low: 'bg-green-500',
};

const CRIME_COLORS: Record<CrimeCategory, string> = {
  'Murder': '#dc2626', 'Robbery': '#ea580c', 'Burglary': '#d97706',
  'Cyber Crime': '#7c3aed', 'Drug Crime': '#0891b2', 'Kidnapping': '#be185d',
  'Fraud': '#1d4ed8', 'Violence': '#b91c1c', 'Traffic Crime': '#15803d',
  'Theft': '#ca8a04', 'Extortion': '#9333ea', 'Assault': '#ef4444',
};

function toggleArrayValue<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

interface AccordionSectionProps {
  icon: React.ReactNode;
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({ icon, title, badge, children, defaultOpen = false }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-slate-400">{icon}</span>
        <span className="font-medium">{title}</span>
        {badge != null && badge > 0 && (
          <span className="ml-auto mr-2 bg-cyan-500 text-navy text-xs font-bold px-1.5 rounded-full">{badge}</span>
        )}
        <ChevronDown className={clsx('w-3.5 h-3.5 ml-auto text-slate-500 transition-transform', open && 'rotate-180')} />
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
            <div className="px-4 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MapSidebar({ filters, onFiltersChange, incidentCount }: MapSidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-slate-950/90 border-r border-slate-700/40 backdrop-blur-xl flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700/40">
        <h2 className="text-sm font-bold text-white tracking-wide">INTELLIGENCE LAYERS</h2>
        <p className="text-xs text-slate-400 mt-0.5">{incidentCount} incidents filtered</p>
      </div>

      {/* Quick Reset */}
      {(filters.districts.length > 0 || filters.crimeCategories.length > 0 ||
        filters.riskLevels.length > 0 || filters.statuses.length > 0) && (
        <button
          onClick={() => onFiltersChange({ districts: [], crimeCategories: [], riskLevels: [], statuses: [] })}
          className="flex items-center gap-2 mx-4 mt-3 px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all bg-red-500/5 hover:bg-red-500/10"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset all filters
        </button>
      )}

      {/* ── Accordion filters ── */}
      <div className="mt-2">
        <AccordionSection
          icon={<MapPin className="w-4 h-4" />}
          title="Districts"
          badge={filters.districts.length}
          defaultOpen
        >
          <div className="flex flex-col gap-1 mt-1">
            {DISTRICTS.map((d) => (
              <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.districts.includes(d)}
                  onChange={() => onFiltersChange({ districts: toggleArrayValue(filters.districts, d) })}
                  className="w-3.5 h-3.5 rounded accent-cyan-400"
                />
                <span className={clsx('text-sm transition-colors', filters.districts.includes(d) ? 'text-cyan-400 font-medium' : 'text-slate-400 group-hover:text-slate-200')}>
                  {d}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          icon={<Shield className="w-4 h-4" />}
          title="Crime Categories"
          badge={filters.crimeCategories.length}
          defaultOpen
        >
          <div className="flex flex-col gap-1 mt-1">
            {CRIME_CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.crimeCategories.includes(c)}
                  onChange={() => onFiltersChange({ crimeCategories: toggleArrayValue(filters.crimeCategories, c) })}
                  className="w-3.5 h-3.5 rounded accent-cyan-400"
                />
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: CRIME_COLORS[c] }}
                />
                <span className={clsx('text-sm transition-colors', filters.crimeCategories.includes(c) ? 'text-cyan-400 font-medium' : 'text-slate-400 group-hover:text-slate-200')}>
                  {c}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          icon={<AlertTriangle className="w-4 h-4" />}
          title="Risk Level"
          badge={filters.riskLevels.length}
        >
          <div className="flex flex-col gap-1 mt-1">
            {RISK_LEVELS.map((r) => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.riskLevels.includes(r)}
                  onChange={() => onFiltersChange({ riskLevels: toggleArrayValue(filters.riskLevels, r) })}
                  className="w-3.5 h-3.5 rounded accent-cyan-400"
                />
                <span className={clsx('w-2 h-2 rounded-full shrink-0', RISK_COLORS[r])} />
                <span className={clsx('text-sm transition-colors', filters.riskLevels.includes(r) ? 'text-cyan-400 font-medium' : 'text-slate-400 group-hover:text-slate-200')}>
                  {r}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          icon={<Activity className="w-4 h-4" />}
          title="Status"
          badge={filters.statuses.length}
        >
          <div className="flex flex-col gap-1 mt-1">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.statuses.includes(s)}
                  onChange={() => onFiltersChange({ statuses: toggleArrayValue(filters.statuses, s) })}
                  className="w-3.5 h-3.5 rounded accent-cyan-400"
                />
                <span className={clsx('text-sm transition-colors', filters.statuses.includes(s) ? 'text-cyan-400 font-medium' : 'text-slate-400 group-hover:text-slate-200')}>
                  {s}
                </span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          icon={<Users className="w-4 h-4" />}
          title="Repeat Offenders"
        >
          <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={filters.repeatOffendersOnly}
              onChange={(e) => onFiltersChange({ repeatOffendersOnly: e.target.checked })}
              className="w-3.5 h-3.5 rounded accent-cyan-400"
            />
            <span className="text-sm text-slate-400">Show repeat offender links only</span>
          </label>
        </AccordionSection>
      </div>

      {/* ── Risk Legend ── */}
      <div className="mt-auto px-4 py-4 border-t border-slate-700/40">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Legend</h3>
        <div className="flex flex-col gap-1.5">
          {RISK_LEVELS.map((r) => (
            <div key={r} className="flex items-center gap-2 text-xs text-slate-400">
              <span className={clsx('w-2.5 h-2.5 rounded-full', RISK_COLORS[r])} />
              {r}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
