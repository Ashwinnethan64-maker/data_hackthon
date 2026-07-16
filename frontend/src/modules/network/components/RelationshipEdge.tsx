import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import type { NetworkEdgeData } from '../types';
import { EDGE_COLORS } from '../types';

function RelationshipEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<NetworkEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relation = data?.relation ?? 'AssociatedWith';
  const color = EDGE_COLORS[relation];
  const isDimmed = data?.dimmed && !data?.highlighted;
  const isHighlighted = data?.highlighted;

  const strokeColor = isDimmed
    ? 'rgba(100,116,139,0.2)'
    : isHighlighted || selected
    ? color
    : `${color}88`;

  const strokeWidth = selected ? 2.5 : isHighlighted ? 2 : 1.5;

  const showLabel =
    selected || isHighlighted || (data?.label && data.label.length < 20);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: relation === 'AssociatedWith' || relation === 'TransferredTo' ? '5,4' : undefined,
          filter:
            isHighlighted || selected
              ? `drop-shadow(0 0 4px ${color}66)`
              : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      {showLabel && data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              fontSize: 9,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              color: isDimmed ? '#334155' : color,
              backgroundColor: isDimmed
                ? 'transparent'
                : 'rgba(8, 17, 32, 0.85)',
              padding: '1px 5px',
              borderRadius: 4,
              border: isDimmed ? 'none' : `1px solid ${color}44`,
              backdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              opacity: isDimmed ? 0.3 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeInner);
