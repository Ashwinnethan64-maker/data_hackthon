import { useCrimeMap } from '../hooks/useCrimeMap';
import { CrimeMap } from './CrimeMap';
import { MapToolbar } from './MapToolbar';
import { MapSidebar } from './MapSidebar';
import { AreaAnalysisPanel } from './AreaAnalysisPanel';

export function CrimeMapPage() {
  const {
    filters,
    updateFilters,
    incidents,
    selectedIncident,
    setSelectedIncident,
    showHeatmap,
    setShowHeatmap,
    mapType,
    setMapType,
    isAnalyzing,
    areaAnalysis,
    analysisError,
    analyzeCurrentArea,
    clearAnalysis,
  } = useCrimeMap();

  const isAnalysisPanelOpen = isAnalyzing || areaAnalysis !== null || analysisError !== null;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Toolbar */}
      <MapToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
        mapType={mapType}
        onToggleMapType={() => setMapType((prev) => (prev === 'standard' ? 'satellite' : 'standard'))}
        onAnalyzeArea={analyzeCurrentArea}
        isAnalyzing={isAnalyzing}
        totalIncidents={incidents.length}
      />

      {/* Main area: Sidebar + Map + Analysis Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <MapSidebar
          filters={filters}
          onFiltersChange={updateFilters}
          incidentCount={incidents.length}
        />

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          <CrimeMap
            incidents={incidents}
            showHeatmap={showHeatmap}
            mapType={mapType}
            onSelectIncident={setSelectedIncident}
          />

          {/* Stats overlay */}
          <div className="absolute bottom-10 left-4 z-[800] flex gap-2">
            {[
              { label: 'Open', count: incidents.filter((i) => i.status === 'Open').length, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              { label: 'Pending', count: incidents.filter((i) => i.status === 'Pending').length, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Closed', count: incidents.filter((i) => i.status === 'Closed').length, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
            ].map(({ label, count, color }) => (
              <div key={label} className={`px-3 py-1.5 rounded-lg border backdrop-blur-xl bg-slate-950/80 text-xs font-medium ${color}`}>
                <span className="font-mono font-bold">{count}</span> {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Area Analysis Panel */}
        <AreaAnalysisPanel
          isOpen={isAnalysisPanelOpen}
          isLoading={isAnalyzing}
          analysis={areaAnalysis}
          error={analysisError}
          onClose={clearAnalysis}
        />
      </div>
    </div>
  );
}
