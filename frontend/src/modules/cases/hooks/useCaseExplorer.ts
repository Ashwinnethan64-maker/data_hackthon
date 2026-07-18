import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { caseService } from '../services/caseService';
import type { CaseRecord, CaseFilterOptions } from '../types';

export function useCaseExplorer() {
  // Table Filter State
  const [filters, setFilters] = useState<CaseFilterOptions>({
    searchQuery: '',
    crimeCategory: '',
    district: '',
    policeStation: '',
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: '',
    ipcSection: '',
    officerName: '',
    hasRepeatOffender: null,
    victimGender: '',
    victimAgeMin: '',
    victimAgeMax: '',
    accusedGender: '',
    accusedAgeMin: '',
    accusedAgeMax: '',
  });

  // Sorting State
  const [sortColumn, setSortColumn] = useState<keyof CaseRecord>('firNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    firNumber: true,
    crimeCategory: true,
    district: true,
    policeStation: true,
    incidentDate: true,
    status: true,
    priority: true,
    officer: true,
    accusedCount: true,
    victimCount: true,
    actions: true,
  });

  // Row Selection State
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Drawer details view State
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Filter sidebar visibility
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Column Widths for Resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    firNumber: 180,
    crimeCategory: 160,
    district: 160,
    policeStation: 160,
    incidentDate: 120,
    status: 120,
    priority: 110,
    officer: 180,
    accusedCount: 85,
    victimCount: 85,
    actions: 70,
  });

  // Query to get paginated cases from backend
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cases', filters, sortColumn, sortDirection, currentPage, pageSize],
    queryFn: () => caseService.getAllCases({
      page: currentPage,
      limit: pageSize,
      sortBy: sortColumn,
      sortOrder: sortDirection,
      ...filters
    }),
    placeholderData: (previousData) => previousData, // keep old data while fetching
  });

  const cases = data?.data || [];
  const totalCount = data?.pagination?.totalRecords || 0;
  const totalPages = data?.pagination?.totalPages || 0;

  // Reset Filters helper
  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      crimeCategory: '',
      district: '',
      policeStation: '',
      status: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      ipcSection: '',
      officerName: '',
      hasRepeatOffender: null,
      victimGender: '',
      victimAgeMin: '',
      victimAgeMax: '',
      accusedGender: '',
      accusedAgeMin: '',
      accusedAgeMax: '',
    });
    setCurrentPage(1);
  };

  // Toggle sorting
  const handleSort = (column: keyof CaseRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Bulk Selection functions
  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const currentPageIds = cases.map((c) => c.id || (c as any).ROWID);
    const allSelected = currentPageIds.every((id) => selectedRowIds.has(id));

    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Selected case full details
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId || (c as any).ROWID === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  return {
    cases,
    totalCount,
    isLoading,
    isError,
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
    setSelectedRowIds,
    toggleSelectRow,
    toggleSelectAll,
    selectedCaseId,
    setSelectedCaseId,
    selectedCase,
    isFilterSidebarOpen,
    setIsFilterSidebarOpen,
    columnWidths,
    setColumnWidths,
  };
}
