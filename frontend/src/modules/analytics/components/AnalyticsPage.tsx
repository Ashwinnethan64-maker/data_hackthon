import { useState } from 'react';
import { Menu } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-140px)] relative">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-[1040] bg-navy/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Mobile menu toggle */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[500] rounded-lg border border-white/10 bg-slate-900/90 p-2 text-slate-300 hover:text-white lg:hidden backdrop-blur-md shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar */}
        <div className={`transition-all duration-300 z-[1050] ${isSidebarOpen ? 'fixed inset-y-0 left-0 w-64 lg:static h-full' : 'fixed -left-64 lg:static w-0 lg:w-64 overflow-hidden h-full'}`}>
          <div className="h-full w-64">
            <AnalyticsSidebar filters={filters} onFiltersChange={updateFilters} />
          </div>
        </div>

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

      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} filters={filters} />
    </div>
  );
}
export default AnalyticsPage;
