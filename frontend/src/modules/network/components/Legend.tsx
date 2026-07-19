import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ChevronDown, X } from 'lucide-react';
import {
  FileText, User, UserCheck, Eye, Shield, Building2,
  Landmark, CreditCard, Phone, Car, MapPin, Map,
  AlertTriangle, Scale,
} from 'lucide-react';
import { ENTITY_COLORS, ENTITY_LABELS, EDGE_COLORS } from '../types';
import type { NetworkEntityType, NetworkEdgeRelation } from '../types';

const ENTITY_ENTRIES = Object.entries(ENTITY_COLORS) as [NetworkEntityType, string][];
const EDGE_ENTRIES = Object.entries(EDGE_COLORS) as [NetworkEdgeRelation, string][];

const EDGE_LABELS: Record<NetworkEdgeRelation, string> = {
  Committed: 'Committed',
  Reported: 'Reported',
  InvestigatedBy: 'Investigated By',
  VictimOf: 'Victim Of',
  AssociatedWith: 'Associated With',
  Owns: 'Owns',
  TransferredTo: 'Transferred To',
  LocatedAt: 'Located At',
  AppearedIn: 'Appeared In',
};

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

type LegendTab = 'entities' | 'relations' | 'risk';

export function Legend() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LegendTab>('entities');

  return (
    <div className="absolute bottom-4 left-4 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-navy/90 backdrop-blur-lg px-3 py-2 shadow-xl transition-all duration-200 hover:bg-navy hover:border-slate-700"
        title="Toggle Legend"
      >
        <LayoutGrid size={12} className="text-cyan" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legend</span>
        <ChevronDown
          size={9}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Legend panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-2 left-0 w-[240px] rounded-2xl border border-slate-800 bg-navy/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Legend</span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-5 w-5 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X size={10} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-900">
              {(['entities', 'relations', 'risk'] as LegendTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? 'text-cyan border-b-2 border-cyan'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'entities' ? 'Types' : tab === 'relations' ? 'Edges' : 'Risk'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-3 max-h-64 overflow-y-auto scrollbar-thin">
              {activeTab === 'entities' && (
                <div className="grid grid-cols-2 gap-1">
                  {ENTITY_ENTRIES.map(([type, color]) => {
                    const Icon = ENTITY_ICONS[type];
                    return (
                      <div key={type} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-slate-800/30">
                        <div
                          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded"
                          style={{ backgroundColor: `${color}22` }}
                        >
                          <Icon size={9} style={{ color }} />
                        </div>
                        <span className="text-[9px] text-slate-300 truncate">
                          {ENTITY_LABELS[type]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'relations' && (
                <div className="flex flex-col gap-1.5">
                  {EDGE_ENTRIES.map(([rel, color]) => {
                    const isDashed = rel === 'AssociatedWith' || rel === 'TransferredTo';
                    return (
                      <div key={rel} className="flex items-center gap-2 px-1">
                        {/* Animated line sample */}
                        <div className="flex-shrink-0" style={{ width: 24, height: 2, position: 'relative' }}>
                          <div
                            style={{
                              width: '100%',
                              height: 2,
                              borderTop: `2px ${isDashed ? 'dashed' : 'solid'} ${color}`,
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-300">{EDGE_LABELS[rel]}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'risk' && (
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Critical', color: '#EF4444', desc: 'Immediate threat — top priority' },
                    { label: 'High', color: '#F97316', desc: 'Significant risk level' },
                    { label: 'Medium', color: '#EAB308', desc: 'Moderate risk — monitor' },
                    { label: 'Low', color: '#22C55E', desc: 'Minimal risk profile' },
                  ].map(({ label, color, desc }) => (
                    <div key={label} className="flex items-start gap-2 px-1">
                      <div
                        className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: `${color}44`, outline: `2px solid ${color}55`, outlineOffset: '1px' }}
                      />
                      <div>
                        <p className="text-[10px] font-semibold" style={{ color }}>{label}</p>
                        <p className="text-[8px] text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
