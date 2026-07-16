import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
  Search, Filter, ZoomIn, ZoomOut, RotateCcw,
  Download, Maximize2, Brain, Layers,
} from 'lucide-react';

interface NetworkToolbarProps {
  totalNodes: number;
  totalEdges: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onReset: () => void;
  onLoadFullGraph: () => void;
  onAIExplain: () => void;
  isFullGraph: boolean;
}

export function NetworkToolbar({
  totalNodes,
  totalEdges,
  isFiltersOpen,
  onToggleFilters,
  onReset,
  onLoadFullGraph,
  onAIExplain,
  isFullGraph,
}: NetworkToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleFit = useCallback(() => {
    fitView({ padding: 0.15, duration: 600 });
  }, [fitView]);

  const handleExport = useCallback(() => {
    // Simple SVG export via querySelector
    const svgEl = document.querySelector<SVGSVGElement>('.react-flow__renderer svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'criminal-network.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex items-center gap-2 border-b border-white/8 bg-navy/90 px-4 py-2.5 backdrop-blur-xl flex-shrink-0">
      {/* Left: stats */}
      <div className="flex items-center gap-3 mr-2">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            {totalNodes} Nodes
          </span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          {totalEdges} Edges
        </span>
      </div>

      <div className="h-5 w-px bg-white/10 mx-1" />

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Filter toggle */}
        <ToolbarButton
          onClick={onToggleFilters}
          active={isFiltersOpen}
          title="Filters"
          icon={<Filter size={14} />}
        />

        {/* Zoom in */}
        <ToolbarButton
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
          icon={<ZoomIn size={14} />}
        />

        {/* Zoom out */}
        <ToolbarButton
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
          icon={<ZoomOut size={14} />}
        />

        {/* Fit view */}
        <ToolbarButton
          onClick={handleFit}
          title="Fit View"
          icon={<Maximize2 size={14} />}
        />

        <div className="h-5 w-px bg-white/10 mx-1" />

        {/* Load full graph */}
        <ToolbarButton
          onClick={onLoadFullGraph}
          active={isFullGraph}
          title={isFullGraph ? 'Full graph loaded' : 'Load Full Graph'}
          icon={<Layers size={14} />}
          label={isFullGraph ? 'Full' : 'Expand'}
        />

        {/* Export */}
        <ToolbarButton
          onClick={handleExport}
          title="Export SVG"
          icon={<Download size={14} />}
        />

        {/* Reset */}
        <ToolbarButton
          onClick={onReset}
          title="Reset Graph"
          icon={<RotateCcw size={14} />}
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: search hint */}
      <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 text-[10px] text-slate-500">
        <Search size={11} />
        <span>Search in sidebar</span>
      </div>

      {/* AI Explain */}
      <button
        onClick={onAIExplain}
        className="ml-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 hover:shadow-purple-800/40"
      >
        <Brain size={13} />
        <span>AI Explain Network</span>
        <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold">
          AI
        </div>
      </button>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  icon,
  active,
  label,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
        active
          ? 'bg-cyan/20 text-cyan border border-cyan/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
