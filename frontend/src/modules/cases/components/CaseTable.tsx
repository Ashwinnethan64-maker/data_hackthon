import React, { useRef } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { CaseStatusBadge } from './CaseStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import type { CaseRecord } from '../types';

interface CaseTableProps {
  cases: CaseRecord[];
  totalCount: number;
  isLoading: boolean;
  visibleColumns: Record<string, boolean>;
  selectedRowIds: Set<string>;
  toggleSelectRow: (id: string) => void;
  toggleSelectAll: () => void;
  sortColumn: keyof CaseRecord;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof CaseRecord) => void;
  columnWidths: Record<string, number>;
  setColumnWidths: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  onRowClick: (id: string) => void;
}

export function CaseTable({
  cases,
  totalCount,
  isLoading,
  visibleColumns,
  selectedRowIds,
  toggleSelectRow,
  toggleSelectAll,
  sortColumn,
  sortDirection,
  onSort,
  columnWidths,
  setColumnWidths,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  onRowClick,
}: CaseTableProps) {
  const resizingColumn = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const startResize = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingColumn.current = columnKey;
    startX.current = e.clientX;
    startWidth.current = columnWidths[columnKey] || 150;

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e: MouseEvent) => {
    if (!resizingColumn.current) return;
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(80, startWidth.current + deltaX);

    setColumnWidths((prev) => ({
      ...prev,
      [resizingColumn.current!]: newWidth,
    }));
  };

  const stopResize = () => {
    resizingColumn.current = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Render sort icon helper
  const renderSortIcon = (columnKey: keyof CaseRecord) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-50 ml-1.5" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-cyan ml-1.5" />
    ) : (
      <ArrowDown className="h-3 w-3 text-cyan ml-1.5" />
    );
  };

  // Check if all rows on this page are selected
  const allPageRowsSelected = cases.length > 0 && cases.every((c) => selectedRowIds.has(c.id));

  if (isLoading) {
    return (
      <Card className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan" />
        <p className="text-sm text-slate-400">Loading crime registers...</p>
      </Card>
    );
  }

  if (cases.length === 0) {
    return (
      <Card className="flex h-96 flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-white">No Crime Records Found</p>
        <p className="mt-1 text-sm text-slate-400 max-w-sm">
          No matches found for the current query or filter parameters. Try resetting filters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 overflow-hidden border border-white/10 bg-slate-900/60 p-0">
      {/* Scrollable table grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              {/* Selection Checkbox Header */}
              <th className="w-12 px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allPageRowsSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-white/10 bg-slate-900 text-cyan focus:ring-cyan cursor-pointer"
                />
              </th>

              {visibleColumns.firNumber && (
                <th
                  style={{ width: columnWidths.firNumber }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('firNumber')}
                >
                  <div className="flex items-center">
                    FIR Number {renderSortIcon('firNumber')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'firNumber')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.crimeCategory && (
                <th
                  style={{ width: columnWidths.crimeCategory }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('crimeCategory')}
                >
                  <div className="flex items-center">
                    Crime Category {renderSortIcon('crimeCategory')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'crimeCategory')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.district && (
                <th
                  style={{ width: columnWidths.district }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('district')}
                >
                  <div className="flex items-center">
                    District {renderSortIcon('district')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'district')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.policeStation && (
                <th
                  style={{ width: columnWidths.policeStation }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('policeStation')}
                >
                  <div className="flex items-center">
                    Station {renderSortIcon('policeStation')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'policeStation')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.incidentDate && (
                <th
                  style={{ width: columnWidths.incidentDate }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('incidentDate')}
                >
                  <div className="flex items-center">
                    Incident Date {renderSortIcon('incidentDate')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'incidentDate')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.status && (
                <th
                  style={{ width: columnWidths.status }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('status')}
                >
                  <div className="flex items-center">
                    Status {renderSortIcon('status')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'status')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.priority && (
                <th
                  style={{ width: columnWidths.priority }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('priority')}
                >
                  <div className="flex items-center">
                    Priority {renderSortIcon('priority')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'priority')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.officer && (
                <th
                  style={{ width: columnWidths.officer }}
                  className="relative px-4 py-4 font-semibold select-none cursor-pointer"
                  onClick={() => onSort('officer')}
                >
                  <div className="flex items-center">
                    Officer {renderSortIcon('officer')}
                  </div>
                  <div onMouseDown={(e) => startResize(e, 'officer')} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-cyan/40 bg-transparent" />
                </th>
              )}

              {visibleColumns.accusedCount && (
                <th style={{ width: columnWidths.accusedCount }} className="px-4 py-4 font-semibold">
                  Accused
                </th>
              )}

              {visibleColumns.victimCount && (
                <th style={{ width: columnWidths.victimCount }} className="px-4 py-4 font-semibold">
                  Victims
                </th>
              )}

              {visibleColumns.actions && (
                <th style={{ width: columnWidths.actions }} className="px-4 py-4 font-semibold text-center">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-900/30">
            {cases.map((record) => {
              const isSelected = selectedRowIds.has(record.id);

              return (
                <tr
                  key={record.id}
                  className={`hover:bg-white/5 transition cursor-pointer ${
                    isSelected ? 'bg-cyan/5' : ''
                  }`}
                  onClick={() => onRowClick(record.id)}
                >
                  {/* Selection Checkbox */}
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(record.id)}
                      className="rounded border-white/10 bg-slate-900 text-cyan focus:ring-cyan cursor-pointer"
                    />
                  </td>

                  {visibleColumns.firNumber && (
                    <td className="px-4 py-3 font-mono text-cyan font-medium">{record.firNumber}</td>
                  )}

                  {visibleColumns.crimeCategory && (
                    <td className="px-4 py-3 text-white font-semibold">{record.crimeCategory}</td>
                  )}

                  {visibleColumns.district && <td className="px-4 py-3">{record.district}</td>}

                  {visibleColumns.policeStation && <td className="px-4 py-3">{record.policeStation}</td>}

                  {visibleColumns.incidentDate && (
                    <td className="px-4 py-3">{new Date(record.incidentDate).toLocaleDateString('en-IN')}</td>
                  )}

                  {visibleColumns.status && (
                    <td className="px-4 py-3">
                      <CaseStatusBadge status={record.status} />
                    </td>
                  )}

                  {visibleColumns.priority && (
                    <td className="px-4 py-3">
                      <PriorityBadge priority={record.priority} />
                    </td>
                  )}

                  {visibleColumns.officer && (
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{record.officer.name}</div>
                      <div className="text-xs text-slate-500">{record.officer.rank}</div>
                    </td>
                  )}

                  {visibleColumns.accusedCount && (
                    <td className="px-4 py-3 text-center text-white">{record.accused.length}</td>
                  )}

                  {visibleColumns.victimCount && (
                    <td className="px-4 py-3 text-center text-white">{record.victims.length}</td>
                  )}

                  {visibleColumns.actions && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => onRowClick(record.id)}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-slate-950/40 px-6 py-4">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{cases.length}</strong> of{' '}
            <strong className="text-white">{totalCount}</strong> FIRs
          </span>
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="py-1.5 px-3 text-xs"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
                    isCurrent
                      ? 'bg-cyan/15 text-cyan border border-cyan/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            className="py-1.5 px-3 text-xs"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
