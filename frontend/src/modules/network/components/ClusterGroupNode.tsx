import { memo } from 'react';
import type { NodeProps } from 'reactflow';

// Risk-level border colors
const RISK_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#EAB308',
  Low: '#22C55E',
};

const CRIME_COLORS: Record<string, string> = {
  Robbery: '#F97316',
  Murder: '#EF4444',
  'Cyber Fraud': '#6366F1',
  'Drug Trafficking': '#A855F7',
  Kidnapping: '#F43F5E',
  Extortion: '#FB923C',
  Theft: '#EAB308',
  Assault: '#DC2626',
};

interface ClusterGroupData {
  label: string;
  riskLevel: string;
  crimeType: string;
  width: number;
  height: number;
}

function ClusterGroupNodeInner({ data }: NodeProps<ClusterGroupData>) {
  const riskColor = RISK_COLORS[data.riskLevel] ?? '#475569';
  const crimeColor = CRIME_COLORS[data.crimeType] ?? riskColor;

  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        borderRadius: 24,
        border: `1.5px solid ${riskColor}28`,
        background: `radial-gradient(ellipse at 30% 30%, ${crimeColor}08 0%, ${riskColor}05 60%, transparent 100%)`,
        boxShadow: `inset 0 0 40px ${riskColor}06`,
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* FIR label badge top-left */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: `${riskColor}99`,
          background: `${riskColor}12`,
          border: `1px solid ${riskColor}22`,
          borderRadius: 6,
          padding: '2px 8px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        {data.label}
        {data.crimeType ? ` · ${data.crimeType}` : ''}
      </div>
    </div>
  );
}

export const ClusterGroupNode = memo(ClusterGroupNodeInner);
