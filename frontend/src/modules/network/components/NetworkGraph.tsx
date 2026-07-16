import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { NetworkNode, NetworkEdge } from '../types';
import { EntityNode } from './EntityNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Legend } from './Legend';
import { MiniMapPanel } from './MiniMapPanel';

// Register custom types outside of component to prevent remounting
const nodeTypes: NodeTypes = { entityNode: EntityNode };
const edgeTypes: EdgeTypes = { relationshipEdge: RelationshipEdge };

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  onNodesChange: Parameters<typeof ReactFlow>[0]['onNodesChange'];
  onEdgesChange: Parameters<typeof ReactFlow>[0]['onEdgesChange'];
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
  onPaneClick: () => void;
  selectedNodeId: string | null;
}

export function NetworkGraph({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  selectedNodeId: _selectedNodeId,
}: NetworkGraphProps) {

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick(node.id);
    },
    [onNodeClick],
  );

  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeDoubleClick(node.id);
    },
    [onNodeDoubleClick],
  );

  // Stable default viewport
  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.6 }), []);

  return (
    <div className="relative flex-1 min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        minZoom={0.1}
        maxZoom={3}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        selectNodesOnDrag={false}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        {/* Dot grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(148, 163, 184, 0.12)"
        />

        {/* Controls (zoom, fit) */}
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          className="!bg-navy/90 !border !border-white/10 !rounded-xl !shadow-xl overflow-hidden !bottom-4 !right-[185px]"
          style={{ gap: 0 }}
        />

        {/* MiniMap */}
        <MiniMapPanel nodes={nodes} />

        {/* Legend */}
        <Legend />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">No entities match the current filters</p>
            <p className="text-xs text-slate-600 mt-1">Adjust filters or reset to see the full network</p>
          </div>
        </div>
      )}
    </div>
  );
}
