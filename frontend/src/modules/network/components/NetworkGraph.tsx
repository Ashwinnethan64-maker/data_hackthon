import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { NetworkNode, NetworkEdge } from '../types';
import { EntityNode } from './EntityNode';
import { ClusterGroupNode } from './ClusterGroupNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Legend } from './Legend';
import { MiniMapPanel } from './MiniMapPanel';
import { Network, GitBranch } from 'lucide-react';

// Register custom types outside of component to prevent remounting
const nodeTypes: NodeTypes = { entityNode: EntityNode, clusterGroup: ClusterGroupNode };
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
  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.55 }), []);

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
        minZoom={0.08}
        maxZoom={3}
        fitView
        fitViewOptions={{ padding: 0.18 }}
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
        {/* Subtle grid background */}
        <Background
          variant={BackgroundVariant.Lines}
          gap={40}
          size={0.5}
          color="rgba(148, 163, 184, 0.04)"
        />


        {/* MiniMap */}
        <MiniMapPanel nodes={nodes} />

        {/* Legend */}
        <Legend />
      </ReactFlow>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-5 text-center">
            {/* Animated network icon */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full border border-white/5 flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }}>
                <div className="h-14 w-14 rounded-full border border-cyan/10 flex items-center justify-center animate-pulse">
                  <Network size={28} className="text-cyan/30" />
                </div>
              </div>
              <GitBranch size={14} className="absolute -top-1 -right-1 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">No entities match the current filters</p>
              <p className="text-xs text-slate-600 mt-1.5">Adjust filters or reset to see the full network</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
