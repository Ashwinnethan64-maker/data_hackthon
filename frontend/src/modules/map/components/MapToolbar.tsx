import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, ChevronDown, Flame, Satellite,
  Download, BrainCircuit, Filter, X, Globe, MapPin, FileSpreadsheet, FileCode, Check, Loader2
} from 'lucide-react';
import clsx from 'clsx';
import type { MapFilters, CrimeCategory, RiskLevel, IncidentStatus, MapIncident } from '../types';

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
  incidents?: MapIncident[];
}

const DISTRICTS = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi', 'Shivamogga', 'Tumakuru', 'Ballari', 'Davanagere', 'Kalaburagi'];
const CRIME_TYPES: CrimeCategory[] = ['Murder', 'Robbery', 'Burglary', 'Cyber Crime', 'Drug Crime', 'Kidnapping', 'Fraud', 'Violence', 'Traffic Crime', 'Theft', 'Extortion', 'Assault'];
const RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES: IncidentStatus[] = ['Open', 'Pending', 'Closed'];

type ActiveDropdown = 'district' | 'crime' | 'risk' | 'status' | 'date' | 'export' | null;

function toggleArrayValue<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export function MapToolbar({
  filters, onFiltersChange, showHeatmap, onToggleHeatmap, mapType,
  onToggleMapType, onAnalyzeArea, isAnalyzing, totalIncidents, incidents = []
}: MapToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside & Escape key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (key: ActiveDropdown) =>
    setActiveDropdown((prev) => (prev === key ? null : key));

  const hasActiveFilters = filters.districts.length > 0 || filters.crimeCategories.length > 0 ||
    filters.riskLevels.length > 0 || filters.statuses.length > 0 || filters.dateRange[0] !== null || filters.dateRange[1] !== null;

  const clearAll = () => onFiltersChange({ districts: [], crimeCategories: [], riskLevels: [], statuses: [], dateRange: [null, null], searchQuery: '' });

  // Functional export implementations
  const exportAsCSV = () => {
    setIsExporting(true);
    setExportMessage('Generating CSV...');
    try {
      const headers = ['FIR Number', 'Category', 'District', 'Police Station', 'Date', 'Time', 'Risk Level', 'Status', 'Latitude', 'Longitude', 'Officer', 'Victims', 'Accused', 'Description'];
      const rows = incidents.map(inc => [
        `"${inc.firNumber}"`,
        `"${inc.category}"`,
        `"${inc.district}"`,
        `"${inc.policeStation}"`,
        `"${inc.date}"`,
        `"${inc.time}"`,
        `"${inc.riskLevel}"`,
        `"${inc.status}"`,
        inc.lat,
        inc.lng,
        `"${inc.officer}"`,
        inc.victimCount,
        inc.accusedCount,
        `"${(inc.description || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `AI_CIOS_Crime_Map_Incidents_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage('CSV Export complete');
      setTimeout(() => setExportMessage(null), 2500);
    } catch (err: any) {
      setExportMessage('Export failed');
      setTimeout(() => setExportMessage(null), 2500);
    } finally {
      setIsExporting(false);
      setActiveDropdown(null);
    }
  };

  const exportAsGeoJSON = () => {
    setIsExporting(true);
    setExportMessage('Generating GeoJSON...');
    try {
      const geoJson = {
        type: 'FeatureCollection',
        features: incidents.map(inc => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [inc.lng, inc.lat]
          },
          properties: {
            firNumber: inc.firNumber,
            category: inc.category,
            district: inc.district,
            policeStation: inc.policeStation,
            date: inc.date,
            time: inc.time,
            riskLevel: inc.riskLevel,
            status: inc.status,
            officer: inc.officer,
            victimCount: inc.victimCount,
            accusedCount: inc.accusedCount,
            description: inc.description
          }
        }))
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `AI_CIOS_Crime_Map_${new Date().toISOString().split('T')[0]}.geojson`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage('GeoJSON Export complete');
      setTimeout(() => setExportMessage(null), 2500);
    } catch (err: any) {
      setExportMessage('Export failed');
      setTimeout(() => setExportMessage(null), 2500);
    } finally {
      setIsExporting(false);
      setActiveDropdown(null);
    }
  };

  return (
    <div ref={toolbarRef} className="relative z-[1100] bg-slate-950/95 border-b border-white/10 backdrop-blur-xl shadow-xl">
      {/* Main Responsive Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5">
        
        {/* LEFT SIDE: Search + Filter Group */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          
          {/* Search FIR input */}
          <div className="relative min-w-[170px] max-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search FIR, area, station…"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-7 py-1.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all shadow-inner h-9"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFiltersChange({ searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="hidden lg:block w-px h-6 bg-white/10 shrink-0" />

          {/* 1. DISTRICT DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('district')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'district' || filters.districts.length > 0
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan" />
              <span>District</span>
              {filters.districts.length > 0 && (
                <span className="bg-cyan text-navy text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {filters.districts.length}
                </span>
              )}
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', activeDropdown === 'district' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'district' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[1200] w-80 rounded-2xl border border-white/10 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Filter by District</span>
                    {filters.districts.length > 0 && (
                      <button onClick={() => onFiltersChange({ districts: [] })} className="text-[10px] text-cyan hover:underline">
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
                    {DISTRICTS.map((d) => (
                      <button
                        key={d}
                        onClick={() => onFiltersChange({ districts: toggleArrayValue(filters.districts, d) })}
                        className={clsx(
                          'px-2.5 py-2 rounded-lg text-xs border transition-all flex items-center justify-between text-left',
                          filters.districts.includes(d)
                            ? 'bg-police/30 border-cyan/50 text-cyan font-medium'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                        )}
                      >
                        <span className="truncate">{d}</span>
                        {filters.districts.includes(d) && <Check className="w-3.5 h-3.5 text-cyan shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. CRIME TYPE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('crime')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'crime' || filters.crimeCategories.length > 0
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Crime Type</span>
              {filters.crimeCategories.length > 0 && (
                <span className="bg-cyan text-navy text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {filters.crimeCategories.length}
                </span>
              )}
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', activeDropdown === 'crime' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'crime' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[1200] w-88 max-w-[92vw] sm:w-96 rounded-2xl border border-white/10 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Filter by Crime Type</span>
                    {filters.crimeCategories.length > 0 && (
                      <button onClick={() => onFiltersChange({ crimeCategories: [] })} className="text-[10px] text-cyan hover:underline">
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {CRIME_TYPES.map((c) => (
                      <button
                        key={c}
                        onClick={() => onFiltersChange({ crimeCategories: toggleArrayValue(filters.crimeCategories, c) })}
                        className={clsx(
                          'px-2 py-2 rounded-lg text-xs border transition-all flex items-center justify-between text-left',
                          filters.crimeCategories.includes(c)
                            ? 'bg-police/30 border-cyan/50 text-cyan font-medium'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                        )}
                      >
                        <span className="truncate">{c}</span>
                        {filters.crimeCategories.includes(c) && <Check className="w-3 h-3 text-cyan shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. RISK LEVEL DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('risk')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'risk' || filters.riskLevels.length > 0
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              <span>Risk Level</span>
              {filters.riskLevels.length > 0 && (
                <span className="bg-cyan text-navy text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {filters.riskLevels.length}
                </span>
              )}
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', activeDropdown === 'risk' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'risk' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[1200] w-60 rounded-2xl border border-white/10 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk Severity</span>
                    {filters.riskLevels.length > 0 && (
                      <button onClick={() => onFiltersChange({ riskLevels: [] })} className="text-[10px] text-cyan hover:underline">
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {RISK_LEVELS.map((r) => (
                      <button
                        key={r}
                        onClick={() => onFiltersChange({ riskLevels: toggleArrayValue(filters.riskLevels, r) })}
                        className={clsx(
                          'px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between',
                          filters.riskLevels.includes(r)
                            ? 'bg-police/30 border-cyan/50 text-cyan font-semibold'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            r === 'Critical' ? 'bg-red-500' :
                            r === 'High' ? 'bg-orange-500' :
                            r === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          {r}
                        </span>
                        {filters.riskLevels.includes(r) && <Check className="w-3.5 h-3.5 text-cyan" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. STATUS DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('status')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'status' || filters.statuses.length > 0
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <span className="bg-cyan text-navy text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {filters.statuses.length}
                </span>
              )}
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', activeDropdown === 'status' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'status' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-[1200] w-56 rounded-2xl border border-white/10 bg-slate-900/98 p-3 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Case Status</span>
                    {filters.statuses.length > 0 && (
                      <button onClick={() => onFiltersChange({ statuses: [] })} className="text-[10px] text-cyan hover:underline">
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => onFiltersChange({ statuses: toggleArrayValue(filters.statuses, s) })}
                        className={clsx(
                          'px-3 py-2 rounded-xl text-xs border transition-all flex items-center justify-between',
                          filters.statuses.includes(s)
                            ? 'bg-police/30 border-cyan/50 text-cyan font-semibold'
                            : 'bg-slate-800/60 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                        )}
                      >
                        <span>{s}</span>
                        {filters.statuses.includes(s) && <Check className="w-3.5 h-3.5 text-cyan" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. DATE RANGE DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('date')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'date' || filters.dateRange[0] || filters.dateRange[1]
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Date Range</span>
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', activeDropdown === 'date' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'date' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 sm:left-auto sm:right-0 md:left-0 top-full mt-2 z-[1200] w-72 rounded-2xl border border-white/10 bg-slate-900/98 p-4 shadow-2xl backdrop-blur-2xl"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Incident Timeline</span>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.dateRange[0] ?? ''}
                        onChange={(e) => onFiltersChange({ dateRange: [e.target.value || null, filters.dateRange[1]] })}
                        className="w-full px-3 py-1.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.dateRange[1] ?? ''}
                        onChange={(e) => onFiltersChange({ dateRange: [filters.dateRange[0], e.target.value || null] })}
                        className="w-full px-3 py-1.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan/50"
                      />
                    </div>
                    {(filters.dateRange[0] || filters.dateRange[1]) && (
                      <button
                        onClick={() => onFiltersChange({ dateRange: [null, null] })}
                        className="text-xs text-cyan hover:underline text-left pt-1"
                      >
                        Clear timeline filter
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT SIDE: Heatmap, Satellite, AI Analyze, Export, Count */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Heatmap toggle */}
          <button
            onClick={onToggleHeatmap}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
              showHeatmap
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/10'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
            )}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Heatmap</span>
          </button>

          {/* Standard / Satellite toggle */}
          <button
            onClick={onToggleMapType}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
              mapType === 'satellite'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
            )}
          >
            {mapType === 'satellite' ? <Satellite className="w-3.5 h-3.5 text-indigo-400" /> : <Globe className="w-3.5 h-3.5 text-cyan" />}
            <span>{mapType === 'satellite' ? 'Satellite' : 'Standard'}</span>
          </button>

          {/* AI Analyze Area */}
          <button
            onClick={onAnalyzeArea}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-police to-cyan text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan/15 hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all h-9 whitespace-nowrap"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
            <span>{isAnalyzing ? 'Analyzing…' : 'AI Analyze Area'}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('export')}
              disabled={isExporting}
              title="Export GIS Data"
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all h-9 whitespace-nowrap',
                activeDropdown === 'export'
                  ? 'bg-police/20 border-cyan/40 text-cyan'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-cyan" />}
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className={clsx('w-3 h-3 transition-transform', activeDropdown === 'export' && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'export' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-[1200] w-52 rounded-2xl border border-white/10 bg-slate-900/98 p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
                    Export Crime Layers
                  </div>
                  <button
                    onClick={exportAsCSV}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-200 hover:bg-white/5 hover:text-cyan transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Spreadsheet (CSV)</div>
                      <div className="text-[10px] text-slate-400">Tabular incident records</div>
                    </div>
                  </button>
                  <button
                    onClick={exportAsGeoJSON}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-slate-200 hover:bg-white/5 hover:text-cyan transition"
                  >
                    <FileCode className="w-4 h-4 text-cyan" />
                    <div>
                      <div className="font-semibold">GIS Map (GeoJSON)</div>
                      <div className="text-[10px] text-slate-400">Spatial polygon/point features</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Incident Counter */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-medium text-slate-400 shrink-0">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono font-bold text-white">{totalIncidents}</span>
            <span className="hidden md:inline">incidents</span>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Feedback */}
      <AnimatePresence>
        {(hasActiveFilters || exportMessage) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between gap-3 px-4 py-1.5 bg-slate-900/60 border-t border-white/5 text-xs overflow-x-auto"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium text-[11px]">Active Filters:</span>
              {filters.districts.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan/10 border border-cyan/30 text-cyan text-[11px] font-medium">
                  {d}
                  <button onClick={() => onFiltersChange({ districts: toggleArrayValue(filters.districts, d) })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.crimeCategories.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium">
                  {c}
                  <button onClick={() => onFiltersChange({ crimeCategories: toggleArrayValue(filters.crimeCategories, c) })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.riskLevels.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                  {r}
                  <button onClick={() => onFiltersChange({ riskLevels: toggleArrayValue(filters.riskLevels, r) })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.statuses.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                  {s}
                  <button onClick={() => onFiltersChange({ statuses: toggleArrayValue(filters.statuses, s) })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(filters.dateRange[0] || filters.dateRange[1]) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-white/10 text-slate-300 text-[11px] font-medium">
                  {filters.dateRange[0] || 'Start'} to {filters.dateRange[1] || 'Now'}
                  <button onClick={() => onFiltersChange({ dateRange: [null, null] })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={clearAll} className="text-rose-400 hover:text-rose-300 ml-1 font-semibold underline text-[11px]">
                Clear all
              </button>
            </div>

            {exportMessage && (
              <span className="text-cyan font-medium shrink-0 ml-auto flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {exportMessage}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
