import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
  FileText, User, UserCheck, Eye, Shield, Building2,
  Landmark, CreditCard, Phone, Car, MapPin, Map,
  AlertTriangle, Scale, Expand,
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

interface EntityNodeProps extends NodeProps<NetworkNodeData> {
  onExpand?: (id: string) => void;
}

function EntityNodeInner({ id, data, selected }: EntityNodeProps) {
  const color = ENTITY_COLORS[data.entityType];
  const Icon = ENTITY_ICONS[data.entityType];
  const isDimmed = data.dimmed && !data.highlighted;
  const isHighlighted = data.highlighted;
  const isCritical = data.riskLevel === 'Critical';

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: isDimmed ? 0.25 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative"
    >
      {/* Critical pulse ring */}
      {isCritical && !isDimmed && (
        <span
          className="absolute inset-[-4px] rounded-full animate-ping opacity-30"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Main node */}
      <div
        className="relative flex flex-col items-center gap-1 cursor-pointer select-none"
        style={{ minWidth: 72 }}
      >
        {/* Icon circle */}
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg transition-all duration-200"
          style={{
            backgroundColor: `${color}22`,
            borderColor: selected || isHighlighted ? color : `${color}66`,
            boxShadow: selected
              ? `0 0 0 3px ${color}44, 0 0 20px ${color}33`
              : isHighlighted
              ? `0 0 12px ${color}44`
              : 'none',
          }}
        >
          <Icon
            size={20}
            style={{ color }}
          />

          {/* Risk score badge */}
          {data.riskScore > 0 && (
            <div
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {data.riskScore > 99 ? '99' : data.riskScore}
            </div>
          )}

          {/* Repeat offender indicator */}
          {data.isRepeatOffender && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-orange-500 ring-1 ring-black" />
          )}
        </div>

        {/* Label */}
        <div
          className="max-w-[100px] text-center text-[10px] font-semibold leading-tight"
          style={{
            color: isDimmed ? '#475569' : '#e2e8f0',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          {data.label.length > 18 ? `${data.label.slice(0, 18)}…` : data.label}
        </div>

        {/* Entity type tag */}
        <div
          className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: `${color}22`,
            color: isDimmed ? '#475569' : color,
          }}
        >
          {data.entityType === 'PoliceStation' ? 'Station' : data.entityType}
        </div>
      </div>

      {/* Expand button */}
      {selected && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 border border-white/20 hover:bg-slate-600 transition-colors"
          onClick={stopPropagation}
          title="Expand connections"
        >
          <Expand size={9} className="text-white" />
        </motion.button>
      )}

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </motion.div>
  );
}

export const EntityNode = memo(EntityNodeInner);
