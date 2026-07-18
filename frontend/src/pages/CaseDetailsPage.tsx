import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, ShieldAlert, AlertTriangle, Sparkles, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { caseService } from '../modules/cases/services/caseService';
import { CaseStatusBadge } from '../modules/cases/components/CaseStatusBadge';
import { PriorityBadge } from '../modules/cases/components/PriorityBadge';
import { VictimCard } from '../modules/cases/components/VictimCard';
import { AccusedCard } from '../modules/cases/components/AccusedCard';
import { OfficerCard } from '../modules/cases/components/OfficerCard';
import { EvidenceCard } from '../modules/cases/components/EvidenceCard';
import { QuickActionsPanel } from '../modules/cases/components/QuickActionsPanel';
import { CaseFormModal } from '../modules/cases/components/CaseFormModal';
import { OfficerAssignModal } from '../modules/cases/components/OfficerAssignModal';
import type { CaseRecord } from '../modules/cases/types';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CRIME_MARKER_CONFIG: Record<string, { color: string; glow: string; symbol: string }> = {
  'Murder':             { color: '#dc2626', glow: 'rgba(220,38,38,0.6)',   symbol: '💀' },
  'Robbery':            { color: '#ea580c', glow: 'rgba(234,88,12,0.6)',   symbol: '🔫' },
  'Burglary':           { color: '#d97706', glow: 'rgba(217,119,6,0.6)',   symbol: '🏚️' },
  'Cybercrime':         { color: '#7c3aed', glow: 'rgba(124,58,237,0.6)',  symbol: '💻' },
  'Cyber Crime':        { color: '#7c3aed', glow: 'rgba(124,58,237,0.6)',  symbol: '💻' },
  'Drug Trafficking':   { color: '#0891b2', glow: 'rgba(8,145,178,0.6)',   symbol: '💊' },
  'Drug Crime':         { color: '#0891b2', glow: 'rgba(8,145,178,0.6)',   symbol: '💊' },
  'Kidnapping':         { color: '#be185d', glow: 'rgba(190,24,93,0.6)',   symbol: '⛓️' },
  'Fraud':              { color: '#1d4ed8', glow: 'rgba(29,78,216,0.6)',   symbol: '📄' },
  'Violence':           { color: '#b91c1c', glow: 'rgba(185,28,28,0.6)',   symbol: '⚠️' },
  'Traffic Crime':      { color: '#15803d', glow: 'rgba(21,128,61,0.6)',   symbol: '🚗' },
  'Theft':              { color: '#ca8a04', glow: 'rgba(202,138,4,0.6)',   symbol: '🎭' },
  'Extortion':          { color: '#9333ea', glow: 'rgba(147,51,234,0.6)',  symbol: '💰' },
  'Assault':            { color: '#ef4444', glow: 'rgba(239,68,68,0.6)',   symbol: '👊' },
  'Rioting':            { color: '#e11d48', glow: 'rgba(225,29,72,0.6)',   symbol: '🔥' },
};

const STATUS_CYCLE: Array<CaseRecord['status']> = ['Open', 'Under Investigation', 'Under Review', 'Closed'];

function createCrimeIcon(category: string): L.DivIcon {
  const config = CRIME_MARKER_CONFIG[category] || CRIME_MARKER_CONFIG['Assault'];
  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${config.glow};
        animation: pulse 2.5s ease-in-out infinite;
      "></div>
      <div style="
        position: relative;
        z-index: 1;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${config.color};
        border: 2px solid rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px ${config.glow}, 0 0 0 1px ${config.color};
      ">
        ${config.symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'crime-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setMutationError(msg);
    setTimeout(() => setMutationError(null), 5000);
  };

  const updateMutation = useMutation({
    mutationFn: ({ caseId, payload }: { caseId: string; payload: any }) =>
      caseService.updateCase(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (err: any) => showError(err.message || 'Failed to update case.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (caseId: string) => caseService.deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      navigate('/cases');
    },
    onError: (err: any) => showError(err.message || 'Failed to archive case.'),
  });

  const isSaving = updateMutation.isPending || deleteMutation.isPending;

  const handleEditSubmit = async (formData: any) => {
    if (!record) return;
    await updateMutation.mutateAsync({ caseId: record.id, payload: formData });
    showSuccess('Case details updated successfully.');
  };

  const handleAssignOfficerSubmit = async (officerId: string) => {
    if (!record) return;
    await updateMutation.mutateAsync({ caseId: record.id, payload: { officerId } });
    showSuccess('Investigating officer reassigned.');
  };

  const handleStatusChange = async (newStatus: CaseRecord['status']) => {
    if (!record) return;
    setIsStatusMenuOpen(false);
    await updateMutation.mutateAsync({ caseId: record.id, payload: { status: newStatus } });
    showSuccess(`Status updated to "${newStatus}".`);
  };

  const handleDeleteCase = async () => {
    if (!record) return;
    await deleteMutation.mutateAsync(record.id);
  };

  const { data: record, isLoading, isError } = useQuery({
    queryKey: ['case', id],
    queryFn: async () => {
      if (!id) throw new Error('No case ID provided');
      const data = await caseService.getCaseByFir(id);
      if (!data) throw new Error('Case not found');
      return data;
    },
    enabled: !!id,
  });

  const handleAskAI = () => {
    if (!record) return;
    navigate('/ai', {
      state: {
        query: `Analyze case ${record.firNumber} details, suspect involvement, acts, and evidence status.`,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan" />
        <p className="text-sm text-slate-400">Retrieving case record from Datastore...</p>
      </div>
    );
  }

  if (isError || !record) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-slate-950 p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-white">Case Not Found</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          The case file with reference ID "{id}" could not be retrieved from the intelligence datastore. It may have been archived or deleted.
        </p>
        <Button onClick={() => navigate('/cases')} className="mt-4">
          Return to Case Explorer
        </Button>
      </div>
    );
  }

  const lat = record.latitude || 15.3173;
  const lng = record.longitude || 75.7139;
  const center: [number, number] = [lat, lng];
  const currentStatusIdx = STATUS_CYCLE.indexOf(record.status);

  return (
    <div className="space-y-6">
      {/* Back navigation & primary action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case Explorer</span>
        </button>

        <Button onClick={handleAskAI} className="flex items-center gap-2 text-xs bg-gradient-to-r from-cyan to-indigo-600 hover:from-cyan/95 hover:to-indigo-500 text-white font-semibold py-2 px-4 shadow-lg shadow-cyan/15 rounded-xl border-none">
          <Sparkles className="h-4 w-4" />
          <span>Ask AI Investigator</span>
        </Button>
      </div>

      {/* Inline feedback banners */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </motion.div>
        )}
        {mutationError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {mutationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Section */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan/80">Intelligence Workspace</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-white tracking-tight">{record.firNumber}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
              Registered crime record case file. Review timeline records, suspect demographics, geospatial indicators, and evidence exhibits.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Inline status selector */}
            <div className="relative">
              <button
                onClick={() => setIsStatusMenuOpen(v => !v)}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                <CaseStatusBadge status={record.status} />
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isStatusMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    className="absolute right-0 top-full mt-1.5 z-50 min-w-[170px] rounded-xl border border-white/10 bg-slate-900 shadow-xl shadow-black/40 overflow-hidden"
                  >
                    {STATUS_CYCLE.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition hover:bg-white/5 ${s === record.status ? 'text-cyan font-semibold' : 'text-slate-300'}`}
                      >
                        <span className={`h-2 w-2 rounded-full shrink-0 ${
                          i === 0 ? 'bg-emerald-400' :
                          i === 1 ? 'bg-cyan' :
                          i === 2 ? 'bg-amber-400' :
                          'bg-slate-500'
                        }`} />
                        {s}
                        {s === record.status && <span className="ml-auto text-cyan">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <PriorityBadge priority={record.priority} />
          </div>
        </div>
      </section>

      {/* Saving overlay indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan" />
          Saving changes...
        </div>
      )}

      {/* Grid Layout Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main block (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan/30 bg-cyan/5 p-5 space-y-3 shadow-inner"
          >
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <ShieldAlert className="h-5 w-5" />
              <span>AI Investigator Crime Insight</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              This case highlights registered <strong>{record.crimeCategory.toLowerCase()}</strong> activity occurring within the jurisdiction of {record.policeStation}. Cross-checking repeat offender datastores shows <strong>{record.accused.filter(a => a.isRepeatOffender).length} accused suspects</strong> flagged with active backlogs. Immediate patrol recommendation and link network analyses are advised.
            </p>
          </motion.div>

          {/* General Incident Info */}
          <Card className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Crime Category</p>
                  <p className="text-white font-medium text-base mt-0.5">{record.crimeCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Incident Date</p>
                  <p className="text-white font-medium text-base mt-0.5">
                    {new Date(record.incidentDate).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">District / Jurisdiction</p>
                  <p className="text-white font-medium text-base mt-0.5">{record.district} District</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Police Station</p>
                  <p className="text-white font-medium text-base mt-0.5">{record.policeStation}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-slate-500 font-semibold uppercase">Incident Description</p>
              <p className="text-sm text-slate-300 leading-relaxed mt-2 p-3 rounded-xl bg-slate-950/40 border border-white/5 font-sans">
                {record.description}
              </p>
            </div>
          </Card>

          {/* Legal Acts */}
          <Card className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Applicable Legal IPC / BNS Sections</h4>
            <div className="flex flex-wrap gap-2">
              {record.applicableActs.map((act) => (
                <Badge key={act} variant="info" className="text-xs font-mono py-1 px-3 bg-cyan/15 text-cyan border border-cyan/30">
                  {act}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Demographics (Victims & Suspects) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Victims */}
            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Victims</span>
                <Badge variant="neutral" className="text-xs py-0.5 px-2">{record.victims.length}</Badge>
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {record.victims.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center">No victim profiles registered</p>
                ) : (
                  record.victims.map((vic, index) => (
                    <VictimCard key={index} victim={vic} />
                  ))
                )}
              </div>
            </Card>

            {/* Accused */}
            <Card className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Accused / Suspects</span>
                <Badge variant="neutral" className="text-xs py-0.5 px-2">{record.accused.length}</Badge>
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {record.accused.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 text-center">No suspects identified yet</p>
                ) : (
                  record.accused.map((acc, index) => (
                    <AccusedCard key={index} accused={acc} />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Evidence Logs */}
          <Card className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Evidence Exhibits</span>
              <Badge variant="neutral" className="text-xs py-0.5 px-2">{record.evidence.length}</Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {record.evidence.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 col-span-2 text-center">No evidence exhibits logged</p>
              ) : (
                record.evidence.map((ev, index) => (
                  <EvidenceCard key={index} evidence={ev} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right sidebar block (Span 1) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <QuickActionsPanel
            record={record}
            onAssignOfficer={() => setIsAssignModalOpen(true)}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => setIsDeleteConfirmOpen(true)}
          />

          {/* Assigned Officer */}
          <Card className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Investigating Officer</h4>
            <OfficerCard officer={record.officer} />
          </Card>

          {/* GPS Location Mini Map */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Geospatial Marker</h4>
              <span className="text-xs font-mono text-cyan flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {lat.toFixed(4)}°, {lng.toFixed(4)}°
              </span>
            </div>

            <div className="h-60 w-full rounded-xl overflow-hidden border border-white/10 relative z-0">
              <MapContainer
                center={center}
                zoom={13}
                zoomControl={true}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#060f1e' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={center} icon={createCrimeIcon(record.crimeCategory)}>
                  <Popup className="custom-leaflet-popup">
                    <div className="text-slate-900 font-sans p-1">
                      <p className="font-mono text-xs font-bold text-cyan-600">{record.firNumber}</p>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5">{record.crimeCategory}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{record.policeStation}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>

          {/* Chronological Timeline */}
          <Card className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan" />
              <span>Investigation Timeline</span>
            </h4>
            <div className="relative pl-6 space-y-5 border-l border-white/10 ml-2">
              {record.timeline.map((step, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                      step.status === 'completed'
                        ? 'bg-success'
                        : step.status === 'current'
                          ? 'bg-cyan animate-pulse'
                          : 'bg-slate-700'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Case Edit Modal */}
      <CaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={record}
      />

      {/* Officer Assignment Modal */}
      <OfficerAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignOfficerSubmit}
        currentOfficerName={record?.officer?.name}
      />

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Archive Case File"
      >
        <div className="space-y-5 text-left">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">This action cannot be undone</p>
              <p className="mt-1 text-xs text-slate-400">
                Case file <span className="font-mono text-white">{record.firNumber}</span> will be archived and removed from the active case explorer. The record is retained in the datastore but marked as inactive.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setIsDeleteConfirmOpen(false);
                await handleDeleteCase();
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-red-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
            >
              {deleteMutation.isPending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              Archive Case
            </button>
          </div>
        </div>
      </Modal>

      {/* Click-outside handler for status menu */}
      {isStatusMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsStatusMenuOpen(false)}
        />
      )}
    </div>
  );
}
