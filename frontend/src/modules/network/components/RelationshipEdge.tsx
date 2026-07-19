import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  getBezierPath,
  type EdgeProps,
} from 'reactflow';
import type { NetworkEdgeData } from '../types';
import { EDGE_COLORS } from '../types';

// CSS injected once for animated dash flow
const FLOW_ANIMATION_CSS = `
@keyframes edgeFlow {
  from { stroke-dashoffset: 20; }
  to   { stroke-dashoffset: 0; }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('edge-flow-css')) {
  const style = document.createElement('style');
  style.id = 'edge-flow-css';
  style.textContent = FLOW_ANIMATION_CSS;
  document.head.appendChild(style);
}

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
  const relation = data?.relation ?? 'AssociatedWith';
  const color = EDGE_COLORS[relation];
  const isDimmed = data?.dimmed && !data?.highlighted;
  const isHighlighted = data?.highlighted;
  const strength = data?.strength ?? 0.5;
  const isActive = isHighlighted || selected;

  // Use straight path when not active to reduce visual clutter,
  // bezier only on highlighted/selected for visual emphasis
  const [edgePath, labelX, labelY] = isActive
    ? getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
    : getStraightPath({ sourceX, sourceY, targetX, targetY });

  // Stroke width: thin by default, thicker when active
  const baseWidth = 0.8 + strength * 0.7;
  const strokeWidth = selected ? baseWidth + 1.8 : isActive ? baseWidth + 1 : baseWidth;

  // Opacity: very faint by default, full when active or not dimmed
  const opacity = isDimmed
    ? 0.04
    : isActive
    ? 1
    : 0.18; // resting state — subtle background web

  const strokeColor = isActive ? color : `${color}`;

  // Dashed for certain relation types
  const isDashed = relation === 'AssociatedWith' || relation === 'TransferredTo';

  // Flow animation only on highlighted/selected
  const flowAnimation =
    isActive && !isDimmed
      ? 'edgeFlow 0.6s linear infinite'
      : undefined;

  const markerId = `arrow-${id}`;

  return (
    <>
      {/* Arrowhead marker */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id={markerId}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L6,3 z"
              fill={strokeColor}
              opacity={opacity}
            />
          </marker>
        </defs>
      </svg>

      {/* Glow blur layer (only when active) */}
      {isActive && !isDimmed && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: strokeWidth + 5,
            opacity: 0.1,
            filter: 'blur(4px)',
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isDashed && isActive ? '6,4' : undefined,
          strokeDashoffset: 0,
          animation: flowAnimation,
          opacity,
          markerEnd: isActive ? `url(#${markerId})` : undefined,
          transition: 'opacity 0.3s, stroke-width 0.2s',
        }}
      />

      {/* Edge label — only when active */}
      {isActive && data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              fontSize: 9,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              color,
              backgroundColor: 'rgba(8,17,32,0.92)',
              padding: '2px 7px',
              borderRadius: 5,
              border: `1px solid ${color}55`,
              backdropFilter: 'blur(6px)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: `0 2px 8px rgba(0,0,0,0.5)`,
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
