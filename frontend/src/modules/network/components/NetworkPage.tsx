import { useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useNetworkGraph } from '../hooks/useNetworkGraph';
import { useEntityDetails } from '../hooks/useEntityDetails';
import { useAIExplanation } from '../hooks/useAIExplanation';
import { NetworkGraph } from './NetworkGraph';
import { NetworkToolbar } from './NetworkToolbar';
import { NetworkStatsStrip } from './NetworkStatsStrip';
import { FilterSidebar } from './FilterSidebar';
import { DetailsPanel } from './DetailsPanel';
import { AIExplanationPanel } from './AIExplanationPanel';
import { getSavedNetworks, getRecentNetworks } from '../services/networkService';

// Pre-load saved/recent
const savedNetworks = getSavedNetworks();
const recentNetworks = getRecentNetworks();

function NetworkPageInner() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    selectedNodeId,
    selectNode,
    expandNode,
    focusNode,
    applyFilters,
    resetGraph,
    loadFullGraph,
    filters,
    searchQuery,
    setSearchQuery,
    searchResults,
    isFiltersOpen,
    setIsFiltersOpen,
    isFullGraph,
    totalNodeCount,
    totalEdgeCount,
  } = useNetworkGraph();

  const { details, isLoading: detailsLoading } = useEntityDetails(selectedNodeId);

  const {
    isOpen: aiOpen,
    explanation,
    isLoading: aiLoading,
    error: aiError,
    openExplanation,
    closeExplanation,
    refresh: aiRefresh,
  } = useAIExplanation();

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
    },
    [selectNode],
  );

  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      expandNode(nodeId);
    },
    [expandNode],
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleCloseDetails = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleSelectSearchResult = useCallback(
    (nodeId: string) => {
      focusNode(nodeId);
    },
    [focusNode],
  );

  return (
    <div className="relative flex h-full overflow-hidden bg-navy">
      {/* Mobile Backdrop */}
      {isFiltersOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Left sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 z-50 bg-navy ${
          isFiltersOpen ? 'fixed inset-y-0 left-0 w-64 border-r border-white/10 lg:static' : 'fixed -left-64 lg:static w-0 overflow-hidden'
        }`}
        style={{ width: isFiltersOpen ? 256 : 0 }}
      >
        {isFiltersOpen && (
          <div className="h-full w-64">
            <FilterSidebar
              filters={filters}
              onApply={applyFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchResults={searchResults}
              onSelectSearchResult={handleSelectSearchResult}
              savedNetworks={savedNetworks}
              recentNetworks={recentNetworks}
              nodeCount={totalNodeCount}
              edgeCount={totalEdgeCount}
            />
          </div>
        )}
      </div>

      {/* Center: toolbar + stats strip + graph */}
      <div className="relative flex flex-1 flex-col min-w-0">
        {/* Toolbar */}
        <NetworkToolbar
          totalNodes={totalNodeCount}
          totalEdges={totalEdgeCount}
          nodes={nodes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSelectSearchResult={handleSelectSearchResult}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={() => setIsFiltersOpen((p) => !p)}
          onReset={resetGraph}
          onLoadFullGraph={loadFullGraph}
          onAIExplain={() => openExplanation(filters)}
          isFullGraph={isFullGraph}
        />

        {/* Stats strip */}
        <NetworkStatsStrip nodes={nodes} edges={edges} />

        {/* Graph canvas */}
        <div className="relative flex flex-1 min-h-0">
          <NetworkGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
            selectedNodeId={selectedNodeId}
          />

          {/* Right: Details panel (absolute overlay) */}
          <DetailsPanel
            details={details}
            isLoading={detailsLoading}
            onClose={handleCloseDetails}
          />

          {/* AI Explanation panel (full overlay) */}
          <AIExplanationPanel
            isOpen={aiOpen}
            isLoading={aiLoading}
            explanation={explanation}
            error={aiError}
            onClose={closeExplanation}
            onRefresh={() => aiRefresh(filters)}
          />
        </div>
      </div>
    </div>
  );
}

export function NetworkPage() {
  return (
    <div className="h-full w-full flex flex-col min-h-0 relative">
      <ReactFlowProvider>
        <NetworkPageInner />
      </ReactFlowProvider>
    </div>
  );
}
