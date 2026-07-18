import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCaseExplorer } from '../modules/cases/hooks/useCaseExplorer';
import { CaseToolbar } from '../modules/cases/components/CaseToolbar';
import { CaseFilters } from '../modules/cases/components/CaseFilters';
import { CaseTable } from '../modules/cases/components/CaseTable';
import { CaseDrawer } from '../modules/cases/components/CaseDrawer';
import { Button } from '../components/Button';
import { caseService } from '../modules/cases/services/caseService';
import { CaseFormModal } from '../modules/cases/components/CaseFormModal';
import { OfficerAssignModal } from '../modules/cases/components/OfficerAssignModal';
import type { CaseRecord } from '../modules/cases/types';

export function CaseExplorerPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseRecord | null>(null);
  const [assigningCase, setAssigningCase] = useState<CaseRecord | null>(null);

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

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newCase: any) => caseService.createCase(newCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      refetch();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => caseService.updateCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case'] });
      refetch();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => caseService.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      setSelectedCaseId(null);
      refetch();
    },
  });

  const handleCreateSubmit = async (formData: any) => {
    await createMutation.mutateAsync(formData);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingCase) return;
    await updateMutation.mutateAsync({ id: editingCase.id, payload: formData });
  };

  const handleAssignOfficerSubmit = async (officerId: string) => {
    if (!assigningCase) return;
    await updateMutation.mutateAsync({ id: assigningCase.id, payload: { officerId } });
  };

  const handleDeleteCase = async (record: CaseRecord) => {
    if (window.confirm(`Are you sure you want to archive case file ${record.firNumber}?`)) {
      await deleteMutation.mutateAsync(record.id);
    }
  };


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
    <div>
      {/* Top Header */}
      <section className="space-y-2 mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">Intelligence Records</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Case Explorer</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Search, filter, and drill down into Karnataka Police FIR records. Open files to see timeline maps, suspects, and legal acts.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full md:w-auto py-2.5 px-4 text-xs rounded-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Log New Case</span>
            </Button>
          </div>
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
            onEdit={(rec) => setEditingCase(rec)}
            onDelete={(rec) => handleDeleteCase(rec)}
            onAssignOfficer={(rec) => setAssigningCase(rec)}
          />
        )}
      </AnimatePresence>

      {/* Case Creation Modal */}
      <CaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Case Edit Modal */}
      <CaseFormModal
        isOpen={!!editingCase}
        onClose={() => setEditingCase(null)}
        onSubmit={handleEditSubmit}
        initialData={editingCase}
      />

      {/* Officer Assignment Modal */}
      <OfficerAssignModal
        isOpen={!!assigningCase}
        onClose={() => setAssigningCase(null)}
        onSubmit={handleAssignOfficerSubmit}
        currentOfficerName={assigningCase?.officer?.name}
      />
    </div>
  );
}
