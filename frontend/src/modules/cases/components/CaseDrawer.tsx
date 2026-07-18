import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { CaseStatusBadge } from './CaseStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { QuickActionsPanel } from './QuickActionsPanel';
import type { CaseRecord } from '../types';

interface CaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: CaseRecord | null;
}

export function CaseDrawer({ isOpen, onClose, record }: CaseDrawerProps) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen || !record) return null;

  const handleOpenWorkspace = () => {
    onClose();
    navigate(`/case/${record.firNumber}`);
  };

  const motionVariants = isMobile
    ? {
        initial: { opacity: 0, scale: 0.95, y: 10, x: 0 },
        animate: { opacity: 1, scale: 1, y: 0, x: 0 },
        exit: { opacity: 0, scale: 0.95, y: 10, x: 0 },
        transition: { duration: 0.2, ease: 'easeOut' },
      }
    : {
        initial: { x: '100%', y: 0, opacity: 1, scale: 1 },
        animate: { x: 0, y: 0, opacity: 1, scale: 1 },
        exit: { x: '100%', y: 0, opacity: 1, scale: 1 },
        transition: { type: 'spring', damping: 25, stiffness: 200 },
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0 lg:justify-end">
      {/* Overlay Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Drawer Body */}
      <motion.div
        variants={motionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10 w-full max-w-lg md:max-w-2xl max-h-[85vh] lg:max-h-none lg:h-screen rounded-2xl lg:rounded-none border lg:border-l border-white/10 lg:border-y-0 lg:border-r-0 bg-slate-950 p-6 shadow-2xl overflow-y-auto"
      >
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 sm:top-8 rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 hover:bg-cyan/10 hover:text-cyan hover:border-cyan/30 transition-all duration-200 z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Drawer Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 pr-8 sm:pr-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Investigation File</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 font-mono">{record.firNumber}</h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenWorkspace}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-cyan px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan/90 transition shadow-lg shadow-cyan/15"
            >
              <span>Open Case Workspace</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* 1. Case Summary Card */}
          <Card className="space-y-3 bg-slate-950/40 border border-white/5 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Case Summary</h4>
              <div className="flex items-center gap-2">
                <CaseStatusBadge status={record.status} />
                <PriorityBadge priority={record.priority} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div>
                <span className="text-slate-500 font-semibold block">Incident Date</span>
                <span className="text-white font-medium">
                  {new Date(record.incidentDate).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Police Station</span>
                <span className="text-white font-medium">{record.policeStation}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Jurisdiction District</span>
                <span className="text-white font-medium">{record.district} District</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">GPS Coordinates</span>
                <span className="text-white font-mono flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan" />
                  {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                </span>
              </div>
              <div className="col-span-2 border-t border-white/5 pt-3">
                <span className="text-slate-500 font-semibold block">Case Brief</span>
                <p className="text-slate-300 text-xs leading-relaxed mt-1 font-sans line-clamp-3 hover:line-clamp-none transition-all duration-300">
                  {record.description}
                </p>
              </div>
            </div>
          </Card>

          {/* 2. Demographics Glimpse (Victims & Suspects) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Victims */}
            <Card className="space-y-3 bg-slate-950/40 border border-white/5 p-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Victims</span>
                <Badge variant="neutral" className="text-xs py-0.5 px-2">{record.victims.length}</Badge>
              </h4>
              <div className="space-y-2 text-xs">
                {record.victims.length === 0 ? (
                  <p className="text-slate-500 italic">No victim profiles registered</p>
                ) : (
                  record.victims.map((vic, index) => (
                    <div key={index} className="flex justify-between text-slate-300 border-b border-white/5 pb-1">
                      <span className="font-medium text-white">{vic.name}</span>
                      <span className="text-slate-400">{vic.gender.charAt(0)} · {vic.age}y</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Suspects */}
            <Card className="space-y-3 bg-slate-950/40 border border-white/5 p-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Suspects</span>
                <Badge variant="neutral" className="text-xs py-0.5 px-2">{record.accused.length}</Badge>
              </h4>
              <div className="space-y-2 text-xs">
                {record.accused.length === 0 ? (
                  <p className="text-slate-500 italic">No suspects identified yet</p>
                ) : (
                  record.accused.map((acc, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-white/5 pb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-white truncate">{acc.name}</span>
                        {acc.isRepeatOffender && (
                          <Badge variant="danger" className="text-[9px] py-0 px-1 font-bold uppercase shrink-0">
                            Repeat
                          </Badge>
                        )}
                      </div>
                      <span className="text-slate-400 shrink-0">{acc.gender.charAt(0)} · {acc.age}y</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* 3. Latest Milestone Status */}
          <Card className="space-y-3 bg-slate-950/40 border border-white/5 p-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Latest Investigation Status</h4>
            {record.timeline && record.timeline.length > 0 ? (
              (() => {
                const latestStep = record.timeline.find(s => s.status === 'current') || record.timeline[record.timeline.length - 1];
                return (
                  <div className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-3 border border-white/5">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${latestStep.status === 'current' ? 'bg-cyan animate-pulse' : 'bg-success'}`} />
                    <div>
                      <p className="text-sm font-semibold text-white">{latestStep.title}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {latestStep.time}
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-500 italic">No milestones registered</p>
            )}
          </Card>

          {/* 5. Quick Actions */}
          <QuickActionsPanel
            record={record}
            onAssignOfficer={() => alert(`Reassigning officer for ${record.firNumber}`)}
          />
        </div>
      </motion.div>
    </div>
  );
}
