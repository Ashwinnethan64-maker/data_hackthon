import { MiniMap } from 'reactflow';
import type { NetworkNode } from '../types';
import { ENTITY_COLORS } from '../types';

interface MiniMapPanelProps {
  nodes: NetworkNode[];
}

export function MiniMapPanel({ nodes: _nodes }: MiniMapPanelProps) {
  return (
    <MiniMap
      nodeColor={(node) => {
        const entityType = (node.data as { entityType: keyof typeof ENTITY_COLORS })?.entityType;
        return entityType ? ENTITY_COLORS[entityType] : '#475569';
      }}
      nodeStrokeWidth={0}
      maskColor="rgba(8, 17, 32, 0.75)"
      className="!bg-navy/90 !border !border-white/10 !rounded-xl overflow-hidden !bottom-4 !right-4 shadow-xl"
      style={{
        width: 160,
        height: 100,
      }}
    />
  );
}
