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
      nodeBorderRadius={4}
      maskColor="rgba(8, 17, 32, 0.80)"
      style={{
        background: 'rgba(8, 17, 32, 0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        width: 160,
        height: 100,
        bottom: 16,
        right: 16,
      }}
    />
  );
}
