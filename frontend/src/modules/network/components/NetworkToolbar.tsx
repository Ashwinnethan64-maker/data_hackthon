import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import {
  Filter, ZoomIn, ZoomOut, RotateCcw,
  Download, Maximize2, Brain, Layers,
} from 'lucide-react';
import { SearchPanel } from './SearchPanel';
import type { NetworkNode } from '../types';

interface NetworkToolbarProps {
  totalNodes: number;
  totalEdges: number;
  nodes?: NetworkNode[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: NetworkNode[];
  onSelectSearchResult: (id: string) => void;
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
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
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
    <div className="flex items-center gap-3 border-b border-slate-800 bg-navy/95 px-5 py-3 backdrop-blur-xl flex-shrink-0">
      {/* Left: node/edge count — compact inline text */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mr-1 select-none flex-shrink-0">
        <span className="text-slate-400 font-semibold">{totalNodes}</span>
        <span>nodes</span>
        <span className="text-slate-700">·</span>
        <span className="text-slate-400 font-semibold">{totalEdges}</span>
        <span>edges</span>
      </div>

      <div className="h-5 w-px bg-slate-800 mx-1" />

      {/* Control buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <ToolbarButton onClick={onToggleFilters} active={isFiltersOpen} title="Toggle Filters" icon={<Filter size={13} />} label="Filters" />
        <div className="mx-1 h-5 w-px bg-slate-800" />
        <ToolbarButton onClick={() => zoomIn({ duration: 300 })} title="Zoom In" icon={<ZoomIn size={13} />} />
        <ToolbarButton onClick={() => zoomOut({ duration: 300 })} title="Zoom Out" icon={<ZoomOut size={13} />} />
        <ToolbarButton onClick={handleFit} title="Fit View" icon={<Maximize2 size={13} />} />
        <div className="mx-1 h-5 w-px bg-slate-800" />
        <ToolbarButton
          onClick={onLoadFullGraph}
          active={isFullGraph}
          title={isFullGraph ? 'Full graph loaded' : 'Load Full Graph'}
          icon={<Layers size={13} />}
          label={isFullGraph ? 'Full Graph' : 'Expand All'}
        />
        <ToolbarButton onClick={handleExport} title="Export SVG" icon={<Download size={13} />} />
        <ToolbarButton onClick={onReset} title="Reset View" icon={<RotateCcw size={13} />} />
      </div>

      <div className="h-5 w-px bg-slate-800 mx-1" />

      {/* Center: real search bar */}
      <div className="flex-1 min-w-0 max-w-xs relative">
        <SearchPanel
          query={searchQuery}
          onQueryChange={onSearchChange}
          results={searchResults}
          onSelectResult={onSelectSearchResult}
        />
      </div>

      <div className="h-5 w-px bg-slate-800 mx-1" />

      {/* Right: AI button */}
      <button
        onClick={onAIExplain}
        className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-800/40 hover:scale-[1.03] transition-all duration-200"
      >
        <Brain size={12} />
        AI Explain
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
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-150 ${
        active
          ? 'bg-cyan/15 text-cyan border border-cyan/25'
          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
      }`}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
