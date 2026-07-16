import { useState } from 'react';
import { Search, Filter, Download, RefreshCw, Eye, CheckSquare } from 'lucide-react';
import { Button } from '../../../components/Button';
import type { CaseFilterOptions } from '../types';

interface CaseToolbarProps {
  filters: CaseFilterOptions;
  setFilters: (filters: CaseFilterOptions) => void;
  isFilterSidebarOpen: boolean;
  setIsFilterSidebarOpen: (open: boolean) => void;
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: (cols: Record<string, boolean>) => void;
  selectedCount: number;
  onBulkClose: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
}

export function CaseToolbar({
  filters,
  setFilters,
  isFilterSidebarOpen,
  setIsFilterSidebarOpen,
  visibleColumns,
  setVisibleColumns,
  selectedCount,
  onBulkClose,
  onRefresh,
  onExportCsv,
}: CaseToolbarProps) {
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchQuery: value });
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns({
      ...visibleColumns,
      [key]: !visibleColumns[key],
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/60"
          placeholder="Search FIR number, officer, descriptions..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Toolbar actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            <span className="text-xs text-cyan font-semibold">{selectedCount} Selected</span>
            <Button variant="secondary" onClick={onBulkClose} className="py-1 px-3 text-xs bg-cyan/15 text-cyan hover:bg-cyan/25 border-cyan/20">
              <CheckSquare className="h-3 w-3" />
              Close Cases
            </Button>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
          className={isFilterSidebarOpen ? 'border-cyan/40 bg-cyan/10 text-white' : ''}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </Button>

        {/* Column Visibility dropdown */}
        <div className="relative">
          <Button variant="secondary" onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}>
            <Eye className="h-4 w-4" />
            <span>Columns</span>
          </Button>

          {showVisibilityDropdown && (
            <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-white/10 bg-slate-950 p-4 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Visible Columns</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.keys(visibleColumns).map((colKey) => (
                  <label key={colKey} className="flex items-center gap-2.5 text-sm text-slate-300 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visibleColumns[colKey]}
                      onChange={() => toggleColumn(colKey)}
                      className="rounded border-white/10 bg-slate-900 text-cyan focus:ring-cyan"
                    />
                    <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button variant="secondary" onClick={onExportCsv}>
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>

        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
