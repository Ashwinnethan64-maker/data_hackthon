import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Users, MapPin, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import type { CaseRecord, CaseVictim, CaseAccused } from '../types';
import { caseService } from '../services/caseService';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: CaseRecord | null;
}

const COMMON_CRIME_CATEGORIES = [
  'Murder',
  'Robbery',
  'Burglary',
  'Cybercrime',
  'Drug Trafficking',
  'Kidnapping',
  'Fraud',
  'Violence',
  'Traffic Crime',
  'Theft',
  'Extortion',
  'Assault',
  'Rioting'
];

const KARNATAKA_DISTRICTS = [
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Belagavi',
  'Dharwad',
  'Mangaluru (Dakshina Kannada)',
  'Udupi',
  'Kalaburagi',
  'Hubballi-Dharwad',
  'Shivamogga',
  'Tumakuru',
  'Davangere',
  'Ballari'
];

// Maps district + station name to a 9-digit CCTNS station prefix (module-level, stable across renders)
function getStationPrefix(dist: string, station: string): string {
  const s = station.toLowerCase();
  if (dist === 'Bengaluru Urban') {
    if (s.includes('indiranagar')) return '100011002';
    if (s.includes('whitefield'))  return '100011003';
    if (s.includes('jayanagar'))   return '800011004';
    return '100011001';
  }
  if (dist === 'Dharwad')  return '100022001';
  if (dist === 'Mysuru')   return '100033001';
  if (dist === 'Belagavi') return '100044001';
  // Fallback: derive a stable 3-digit district code from name hash → always 9 digits total
  const hash = dist.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const distCode = String((hash % 900) + 100); // always 3 digits (100-999)
  return `1${distCode}1001`; // 1 + 3 + 1001 = 9 digits
}

export function CaseFormModal({ isOpen, onClose, onSubmit, initialData }: CaseFormModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [firNumber, setFirNumber] = useState('');
  const [crimeCategory, setCrimeCategory] = useState(COMMON_CRIME_CATEGORIES[0]);
  const [district, setDistrict] = useState(KARNATAKA_DISTRICTS[0]);
  const [policeStation, setPoliceStation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState<'Open' | 'Under Investigation' | 'Under Review' | 'Closed'>('Open');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [description, setDescription] = useState('');
  const [applicableActs, setApplicableActs] = useState('');
  
  // Dynamic arrays
  const [victims, setVictims] = useState<CaseVictim[]>([]);
  const [accused, setAccused] = useState<CaseAccused[]>([]);



  // Main input sync
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFirNumber(initialData.firNumber || '');
        setCrimeCategory(initialData.crimeCategory || COMMON_CRIME_CATEGORIES[0]);
        setDistrict(initialData.district || KARNATAKA_DISTRICTS[0]);
        setPoliceStation(initialData.policeStation || '');
        
        const d = new Date(initialData.incidentDate);
        if (!isNaN(d.getTime())) {
          const tzoffset = d.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
          setIncidentDate(localISOTime);
        } else {
          setIncidentDate('');
        }
        setLatitude(String(initialData.latitude || ''));
        setLongitude(String(initialData.longitude || ''));
        setStatus(initialData.status || 'Open');
        setPriority(initialData.priority || 'Medium');
        setDescription(initialData.description || '');
        setApplicableActs((initialData.applicableActs || []).join(', '));
        setVictims(initialData.victims || []);
        setAccused(initialData.accused || []);
      } else {
        setCrimeCategory(COMMON_CRIME_CATEGORIES[0]);
        setDistrict(KARNATAKA_DISTRICTS[0]);
        setPoliceStation('');
        
        const now = new Date();
        const tzoffset = now.getTimezoneOffset() * 60000;
        setIncidentDate((new Date(now.getTime() - tzoffset)).toISOString().slice(0, 16));
        setLatitude('12.9716');
        setLongitude('77.5946');
        setStatus('Open');
        setPriority('Medium');
        setDescription('');
        setApplicableActs('IPC 379, IPC 420');
        setVictims([]);
        setAccused([]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  // Auto-generate sequential 18-digit CCTNS FIR number whenever district, station, or year changes.
  // AbortController cancels any stale in-flight request when deps change before it resolves.
  useEffect(() => {
    if (!isOpen || initialData) return;

    const controller = new AbortController();
    const year = new Date(incidentDate || new Date()).getFullYear();
    const prefix = getStationPrefix(district, policeStation);

    const fetchNext = async () => {
      try {
        // Fetch all cases for this district (no station filter — station names are freeform
        // and an exact-match filter would return nothing if the name isn't an exact DB match)
        const res = await caseService.getAllCases({
          district,
          limit: 500,
        });
        if (controller.signal.aborted) return;

        // Scan all returned FIRs to find the highest sequence under this prefix + year
        let maxSeq = 0;
        for (const c of (res.data ?? [])) {
          const fir = c.firNumber ?? '';
          if (/^\d{18}$/.test(fir)) {
            const firPrefix = fir.substring(0, 9);
            const firYear   = parseInt(fir.substring(9, 13), 10);
            const firSeq    = parseInt(fir.substring(13), 10);
            if (firPrefix === prefix && firYear === year && !isNaN(firSeq)) {
              if (firSeq > maxSeq) maxSeq = firSeq;
            }
          }
        }

        setFirNumber(`${prefix}${year}${String(maxSeq + 1).padStart(5, '0')}`);
      } catch {
        if (controller.signal.aborted) return;
        setFirNumber(`${prefix}${year}${String(Math.floor(1 + Math.random() * 99999)).padStart(5, '0')}`);
      }
    };

    fetchNext();
    return () => controller.abort();
  }, [isOpen, initialData, district, policeStation, incidentDate]);

  // Victim helpers
  const addVictim = () => {
    setVictims([...victims, { name: '', gender: 'Male', age: 30 }]);
  };

  const updateVictim = (index: number, field: keyof CaseVictim, value: any) => {
    const updated = [...victims];
    updated[index] = { ...updated[index], [field]: value };
    setVictims(updated);
  };

  const removeVictim = (index: number) => {
    setVictims(victims.filter((_, i) => i !== index));
  };

  // Accused helpers
  const addAccused = () => {
    setAccused([...accused, { name: '', gender: 'Male', age: 30, isRepeatOffender: false }]);
  };

  const updateAccused = (index: number, field: keyof CaseAccused, value: any) => {
    const updated = [...accused];
    updated[index] = { ...updated[index], [field]: value };
    setAccused(updated);
  };

  const removeAccused = (index: number) => {
    setAccused(accused.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firNumber.trim()) return setError('FIR Number is required.');
    if (!/^\d{18}$/.test(firNumber.trim())) {
      return setError('FIR Number must be exactly 18 digits (numeric string).');
    }
    if (!policeStation.trim()) return setError('Police Station is required.');
    if (!incidentDate) return setError('Incident Date/Time is required.');
    if (!latitude || isNaN(Number(latitude))) return setError('Valid Latitude is required.');
    if (!longitude || isNaN(Number(longitude))) return setError('Valid Longitude is required.');
    if (!description.trim()) return setError('Case Brief/Description is required.');

    setSubmitting(true);
    setError(null);

    // Prepare payload
    const acts = applicableActs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      firNumber: firNumber.trim(),
      crimeCategory,
      district,
      policeStation: policeStation.trim(),
      incidentDate: new Date(incidentDate).toISOString(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      status,
      priority,
      description: description.trim(),
      applicableActs: acts,
      victims,
      accused,
      evidence: initialData?.evidence || [],
      timeline: initialData?.timeline || [
        { title: 'FIR Filed', time: new Date(incidentDate).toLocaleString('en-IN'), status: 'completed' },
        { title: 'Investigation Initiated', time: new Date().toLocaleString('en-IN'), status: 'current' }
      ]
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit case data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Case - ${initialData.firNumber}` : 'Log New FIR Case'}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar text-left">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: General Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Shield className="h-4 w-4 text-cyan" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">General Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fir-number" className="block text-xs font-medium text-slate-400 mb-1.5">FIR Number</label>
              <input
                id="fir-number"
                type="text"
                className="w-full min-h-[44px] rounded-xl border border-white/5 bg-slate-950/40 px-3.5 py-2 text-sm text-slate-500 font-mono cursor-not-allowed select-none focus:outline-none"
                value={firNumber}
                disabled
                required
              />
              <span className="text-[10px] text-cyan/70 mt-1 block">Allocated automatically by CCTNS.</span>
            </div>

            <div>
              <label htmlFor="crime-category" className="block text-xs font-medium text-slate-400 mb-1.5">Crime Category</label>
              <select
                id="crime-category"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60"
                value={crimeCategory}
                onChange={(e) => setCrimeCategory(e.target.value)}
              >
                {COMMON_CRIME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-xs font-medium text-slate-400 mb-1.5">District</label>
              <select
                id="district"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {KARNATAKA_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="police-station" className="block text-xs font-medium text-slate-400 mb-1.5">Police Station</label>
              <input
                id="police-station"
                type="text"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                placeholder="e.g. Koramangala Station"
                required
              />
            </div>

            <div>
              <label htmlFor="incident-date" className="block text-xs font-medium text-slate-400 mb-1.5">Incident Date & Time</label>
              <input
                id="incident-date"
                type="datetime-local"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60 [color-scheme:dark]"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="latitude" className="block text-xs font-medium text-slate-400 mb-1.5">Latitude</label>
                <input
                  id="latitude"
                  type="text"
                  className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan/60"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 12.9716"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-xs font-medium text-slate-400 mb-1.5">Longitude</label>
                <input
                  id="longitude"
                  type="text"
                  className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan/60"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.5946"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select
                id="status"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Under Review">Under Review</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-xs font-medium text-slate-400 mb-1.5">Priority Level</label>
              <select
                id="priority"
                className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Details & Acts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <MapPin className="h-4 w-4 text-cyan" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Incident Details & Legal Framework</h3>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-slate-400 mb-1.5">Case Brief / Description</label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan/60 leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail, modus operandi, physical evidence details..."
              required
            />
          </div>

          <div>
            <label htmlFor="applicable-acts" className="block text-xs font-medium text-slate-400 mb-1.5">Applicable Acts / Sections (Comma Separated)</label>
            <input
              id="applicable-acts"
              type="text"
              className="w-full min-h-[44px] rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan/60"
              value={applicableActs}
              onChange={(e) => setApplicableActs(e.target.value)}
              placeholder="e.g. IPC 302, IPC 379, BNS 103"
            />
          </div>
        </div>

        {/* Section 3: Victims */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Victim Demographics</h3>
            </div>
            <button
              type="button"
              onClick={addVictim}
              className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all font-semibold"
            >
              <Plus className="h-3 w-3" />
              <span>Add Victim</span>
            </button>
          </div>

          {victims.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1 text-center bg-slate-950/20 rounded-xl border border-dashed border-white/5">
              No victim profiles registered yet.
            </p>
          ) : (
            <div className="space-y-3">
              {victims.map((vic, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl border border-white/5 bg-slate-950/40 relative group">
                  <div className="flex-1">
                    <label className="sr-only">Victim Name</label>
                    <input
                      type="text"
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/60"
                      value={vic.name}
                      onChange={(e) => updateVictim(index, 'name', e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="sr-only">Gender</label>
                    <select
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      value={vic.gender}
                      onChange={(e) => updateVictim(index, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="sr-only">Age</label>
                    <input
                      type="number"
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/60"
                      value={vic.age}
                      onChange={(e) => updateVictim(index, 'age', Number(e.target.value))}
                      placeholder="Age"
                      min={0}
                      max={120}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVictim(index)}
                    className="self-end sm:self-center p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove Victim"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Accused */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suspect/Accused Demographics</h3>
            </div>
            <button
              type="button"
              onClick={addAccused}
              className="flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all font-semibold"
            >
              <Plus className="h-3 w-3" />
              <span>Add Suspect</span>
            </button>
          </div>

          {accused.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1 text-center bg-slate-950/20 rounded-xl border border-dashed border-white/5">
              No suspects identified yet.
            </p>
          ) : (
            <div className="space-y-3">
              {accused.map((acc, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl border border-white/5 bg-slate-950/40 relative group">
                  <div className="flex-1">
                    <label className="sr-only">Suspect Name</label>
                    <input
                      type="text"
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/60"
                      value={acc.name}
                      onChange={(e) => updateAccused(index, 'name', e.target.value)}
                      placeholder="Suspect/Accused Name"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="sr-only">Gender</label>
                    <select
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      value={acc.gender}
                      onChange={(e) => updateAccused(index, 'gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="sr-only">Age</label>
                    <input
                      type="number"
                      className="w-full min-h-[38px] rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan/60"
                      value={acc.age}
                      onChange={(e) => updateAccused(index, 'age', Number(e.target.value))}
                      placeholder="Age"
                      min={0}
                      max={120}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 select-none shrink-0 self-start sm:self-center">
                    <input
                      id={`repeat-${index}`}
                      type="checkbox"
                      className="rounded border-white/10 bg-slate-950 text-cyan focus:ring-cyan h-4 w-4"
                      checked={acc.isRepeatOffender}
                      onChange={(e) => updateAccused(index, 'isRepeatOffender', e.target.checked)}
                    />
                    <label htmlFor={`repeat-${index}`} className="text-[11px] text-slate-400 cursor-pointer">Repeat</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccused(index)}
                    className="self-end sm:self-center p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Remove Suspect"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs rounded-xl"
          >
            {submitting ? 'Saving...' : initialData ? 'Update Case File' : 'Log Case File'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
