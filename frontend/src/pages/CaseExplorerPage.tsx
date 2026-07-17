import { AnimatePresence } from 'framer-motion';
import { Badge } from '../components/Badge';
import { useCaseExplorer } from '../modules/cases/hooks/useCaseExplorer';
import { CaseToolbar } from '../modules/cases/components/CaseToolbar';
import { CaseFilters } from '../modules/cases/components/CaseFilters';
import { CaseTable } from '../modules/cases/components/CaseTable';
import { CaseDrawer } from '../modules/cases/components/CaseDrawer';

export function CaseExplorerPage() {
  const {
    cases,
    totalCount,
    isLoading,
    refetch,
    filters,
    setFilters,
    resetFilters,
    sortColumn,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    visibleColumns,
    setVisibleColumns,
    selectedRowIds,
    toggleSelectRow,
    toggleSelectAll,
    selectedCase,
    setSelectedCaseId,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    columnWidths,
    setColumnWidths,
  } = useCaseExplorer();

  // Export to CSV helper
  const handleExportCsv = () => {
    if (cases.length === 0) return;
    const headers = ['FIR Number', 'Crime Category', 'District', 'Station', 'Incident Date', 'Status', 'Priority', 'Officer'];
    const csvRows = [
      headers.join(','),
      ...cases.map((c) =>
        [
          `"${c.firNumber}"`,
          `"${c.crimeCategory}"`,
          `"${c.district}"`,
          `"${c.policeStation}"`,
          `"${c.incidentDate.slice(0, 10)}"`,
          `"${c.status}"`,
          `"${c.priority}"`,
          `"${c.officer.name}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Case_Explorer_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
  };

  const handleBulkClose = () => {
    alert(`Bulk close initiated for: ${Array.from(selectedRowIds).join(', ')}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">Intelligence Records</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Case Explorer</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Search, filter, and drill down into Karnataka Police FIR records. Open files to see timeline maps, suspects, and legal acts.
            </p>
          </div>
          <Badge variant="info" className="w-fit">
            System Database Live
          </Badge>
        </div>
      </section>

      {/* Main Grid: Toolbar, Filters, and Table */}
      <div className="space-y-4">
        <CaseToolbar
          filters={filters}
          setFilters={setFilters}
          isFilterSidebarOpen={isFilterSidebarOpen}
          setIsFilterSidebarOpen={setIsFilterSidebarOpen}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          selectedCount={selectedRowIds.size}
          onBulkClose={handleBulkClose}
          onRefresh={refetch}
          onExportCsv={handleExportCsv}
        />

        <div className="flex flex-col lg:flex-row items-start gap-6 relative">
          {/* Advanced filter sidebar on left */}
          <CaseFilters
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            isOpen={isFilterSidebarOpen}
            onClose={() => setIsFilterSidebarOpen(false)}
          />

          {/* Interactive grid on right */}
          <div className="flex-1 w-full min-w-0">
            <CaseTable
              cases={cases}
              totalCount={totalCount}
              isLoading={isLoading}
              visibleColumns={visibleColumns}
              selectedRowIds={selectedRowIds}
              toggleSelectRow={toggleSelectRow}
              toggleSelectAll={toggleSelectAll}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              columnWidths={columnWidths}
              setColumnWidths={setColumnWidths}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              onRowClick={(id) => setSelectedCaseId(id)}
            />
          </div>
        </div>
      </div>

      {/* Details Slide-Over Drawer */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDrawer
            isOpen={!!selectedCase}
            onClose={() => setSelectedCaseId(null)}
            record={selectedCase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
