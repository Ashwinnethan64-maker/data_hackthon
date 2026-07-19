import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
  FileText, User, UserCheck, Eye, Shield, Building2,
  Landmark, CreditCard, Phone, Car, MapPin, Map,
  AlertTriangle, Scale, GitMerge,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { NetworkNodeData, NetworkEntityType } from '../types';
import { ENTITY_COLORS } from '../types';

// ── Icon map ─────────────────────────────────────────────────────────────────
const ENTITY_ICONS: Record<NetworkEntityType, React.ElementType> = {
  FIR: FileText,
  Accused: User,
  Victim: UserCheck,
  Witness: Eye,
  Officer: Shield,
  PoliceStation: Building2,
  Court: Landmark,
  BankAccount: CreditCard,
  Phone: Phone,
  Vehicle: Car,
  Address: MapPin,
  District: Map,
  CrimeCategory: AlertTriangle,
  IPCSection: Scale,
};

// ── Short type labels ─────────────────────────────────────────────────────────
const ENTITY_SHORT: Record<NetworkEntityType, string> = {
  FIR: 'FIR',
  Accused: 'Accused',
  Victim: 'Victim',
  Witness: 'Witness',
  Officer: 'Officer',
  PoliceStation: 'Station',
  Court: 'Court',
  BankAccount: 'Account',
  Phone: 'Phone',
  Vehicle: 'Vehicle',
  Address: 'Address',
  District: 'District',
  CrimeCategory: 'Crime',
  IPCSection: 'IPC',
};

// ── Risk badge config ─────────────────────────────────────────────────────────
const RISK_BADGE: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#EF444422', text: '#EF4444' },
  High: { bg: '#F9731622', text: '#F97316' },
  Medium: { bg: '#EAB30822', text: '#EAB308' },
  Low: { bg: '#22C55E22', text: '#22C55E' },
};

interface EntityNodeProps extends NodeProps<NetworkNodeData> {
  onExpand?: (id: string) => void;
}

function EntityNodeInner({ id, data, selected }: EntityNodeProps) {
  const color = ENTITY_COLORS[data.entityType];
  const Icon = ENTITY_ICONS[data.entityType];
  const isDimmed = data.dimmed && !data.highlighted;
  const isHighlighted = data.highlighted;
  const isCritical = data.riskLevel === 'Critical';
  const isHigh = data.riskLevel === 'High';
  const riskBadge = RISK_BADGE[data.riskLevel] ?? RISK_BADGE.Low;

  // Scale card slightly for high-risk entities
  const riskScale = isCritical ? 1.08 : isHigh ? 1.04 : 1;

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const cardOpacity = isDimmed ? 0.18 : 1;

  // Compute node card size dynamically based on entity type
  const isFIR = data.entityType === 'FIR';
  const isWide = data.entityType === 'PoliceStation' || data.entityType === 'CrimeCategory';
  const cardWidth = isFIR ? 175 : isWide ? 170 : 155;
  const maxLabelLength = isFIR ? 24 : 18;
  const displayLabel = data.label.length > maxLabelLength 
    ? `${data.label.slice(0, maxLabelLength)}…` 
    : data.label;

  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{
        scale: selected ? riskScale * 1.05 : riskScale,
        opacity: cardOpacity,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="relative"
      style={{ width: cardWidth }}
    >
      {/* Critical / repeat offender pulse ring */}
      {(isCritical || data.isRepeatOffender) && !isDimmed && (
        <span
          className="absolute inset-[-5px] rounded-2xl animate-ping opacity-20"
          style={{ backgroundColor: isCritical ? '#EF4444' : '#F97316' }}
        />
      )}

      {/* Main card */}
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-200"
        style={{
          background: isDimmed
            ? 'rgba(15,23,42,0.4)'
            : `linear-gradient(135deg, rgba(8,17,32,0.92) 0%, rgba(${hexToRgb(color)},0.08) 100%)`,
          border: selected
            ? `1.5px solid ${color}`
            : isHighlighted
            ? `1.5px solid ${color}99`
            : `1px solid ${color}44`,
          boxShadow: selected
            ? `0 0 0 3px ${color}30, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`
            : isHighlighted
            ? `0 0 16px ${color}30, 0 4px 16px rgba(0,0,0,0.5)`
            : '0 2px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Colored top accent bar */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}44)`,
            opacity: isDimmed ? 0.3 : 1,
          }}
        />

        {/* Card body */}
        <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-1.5">
          {/* Icon circle */}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isDimmed ? '#1e293b' : `${color}22`,
              border: `1px solid ${isDimmed ? 'rgba(255,255,255,0.05)' : `${color}55`}`,
            }}
          >
            <Icon size={14} style={{ color: isDimmed ? '#475569' : color }} />
          </div>

          {/* Label + type */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-bold leading-tight truncate"
              style={{
                color: isDimmed ? '#475569' : '#e2e8f0',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {displayLabel}
            </p>
            <p
              className="text-[8px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: isDimmed ? '#334155' : `${color}cc` }}
            >
              {ENTITY_SHORT[data.entityType]}
            </p>
          </div>

          {/* Risk score badge (top right inside card) */}
          {data.riskScore > 0 && (
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-lg px-1.5 py-0.5 text-[9px] font-black"
              style={{
                backgroundColor: isDimmed ? '#1e293b' : riskBadge.bg,
                color: isDimmed ? '#334155' : riskBadge.text,
              }}
            >
              {data.riskScore > 99 ? '99+' : data.riskScore}
            </div>
          )}
        </div>

        {/* Bottom strip — FIR count + indicators */}
        {(data.firCount > 0 || data.isRepeatOffender || (data.crimeTypes && data.crimeTypes.length > 0)) && (
          <div
            className="flex items-center gap-1.5 px-2.5 pb-2"
            style={{ opacity: isDimmed ? 0.3 : 1 }}
          >
            {/* FIR count chip */}
            {data.firCount > 0 && (
              <div
                className="flex items-center gap-0.5 rounded px-1 py-0.5 text-[8px] font-bold"
                style={{ backgroundColor: '#3B82F622', color: '#3B82F6' }}
              >
                <FileText size={7} />
                {data.firCount}
              </div>
            )}

            {/* Repeat offender indicator */}
            {data.isRepeatOffender && (
              <div
                className="rounded px-1 py-0.5 text-[7px] font-black uppercase tracking-wide"
                style={{ backgroundColor: '#F9731622', color: '#F97316' }}
              >
                RPT
              </div>
            )}

            {/* Crime type chip (first one) */}
            {data.crimeTypes && data.crimeTypes[0] && (
              <div
                className="flex-1 min-w-0 rounded px-1 py-0.5 text-[7px] font-semibold truncate"
                style={{ backgroundColor: `${color}15`, color: `${color}cc` }}
              >
                {data.crimeTypes[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expand button — floats outside card when selected */}
      {selected && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full shadow-lg transition-colors"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            border: '1.5px solid rgba(255,255,255,0.2)',
            boxShadow: `0 0 12px ${color}66`,
          }}
          onClick={stopPropagation}
          title="Expand connections"
        >
          <GitMerge size={10} className="text-white" />
        </motion.button>
      )}

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!opacity-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0 !w-0 !h-0" />
    </motion.div>
  );
}

// Utility: convert hex color to rgb values for use in rgba()
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

export const EntityNode = memo(EntityNodeInner);
