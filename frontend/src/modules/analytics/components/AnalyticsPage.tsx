import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { AnalyticsToolbar } from './AnalyticsToolbar';
import { AnalyticsSidebar } from './AnalyticsSidebar';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ExportDialog } from './ExportDialog';

export function AnalyticsPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    filteredFirs,
    filteredOfficers,
    kpis,
    anomalies,
    forecastData,
    aiInsights,
    isGeneratingAI,
    triggerAIInsights
  } = useAnalytics();

  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-950/20 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <AnalyticsToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        onTriggerAI={triggerAIInsights}
        isGeneratingAI={isGeneratingAI}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <AnalyticsSidebar filters={filters} onFiltersChange={updateFilters} />

        {/* Main Analytics Dashboard */}
        <AnalyticsDashboard
          kpis={kpis}
          filteredFirs={filteredFirs}
          filteredOfficers={filteredOfficers}
          forecastData={forecastData}
          anomalies={anomalies}
          aiInsights={aiInsights}
          isGeneratingAI={isGeneratingAI}
        />
      </div>

      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
export default AnalyticsPage;
