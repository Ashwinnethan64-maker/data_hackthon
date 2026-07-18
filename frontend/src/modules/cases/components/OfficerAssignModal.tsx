import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Search, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { caseService } from '../services/caseService';

interface OfficerAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (officerId: string) => Promise<void>;
  currentOfficerName?: string;
}

export function OfficerAssignModal({ isOpen, onClose, onSubmit, currentOfficerName }: OfficerAssignModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Officers List
  const { data: officers = [], isLoading, isError } = useQuery({
    queryKey: ['officers'],
    queryFn: () => caseService.getOfficers(),
    enabled: isOpen,
  });

  const filteredOfficers = officers.filter(
    (off: any) =>
      off.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.badgeNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOfficer = async (officerId: string) => {
    setSubmittingId(officerId);
    setError(null);
    try {
      await onSubmit(officerId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign officer. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Investigating Officer">
      <div className="space-y-4 text-left">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan"
            placeholder="Search officer name, role, badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Officer Status */}
        {currentOfficerName && (
          <div className="text-xs text-slate-400 border-b border-white/5 pb-2">
            Currently Assigned: <span className="text-white font-semibold">{currentOfficerName}</span>
          </div>
        )}

        {/* List of Officers */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan" />
              <span className="text-xs text-slate-500">Retrieving officers list...</span>
            </div>
          ) : isError ? (
            <p className="text-xs text-red-400 text-center py-4">Failed to load officers. Please try again.</p>
          ) : filteredOfficers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No officers found matching search.</p>
          ) : (
            filteredOfficers.map((officer: any) => {
              const isCurrent = officer.name === currentOfficerName;
              const isPending = submittingId === (officer.ROWID || officer.id);

              return (
                <button
                  key={officer.ROWID || officer.id}
                  onClick={() => handleSelectOfficer(officer.ROWID || officer.id)}
                  disabled={isCurrent || submittingId !== null}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                    isCurrent
                      ? 'border-cyan/20 bg-cyan/5 cursor-default'
                      : 'border-white/5 bg-slate-950/40 hover:border-cyan/40 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${isCurrent ? 'bg-cyan/15 text-cyan' : 'bg-slate-900 text-slate-400'}`}>
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{officer.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {officer.role ? (officer.role.charAt(0).toUpperCase() + officer.role.slice(1)) : 'Investigator'} · {officer.badgeNumber || 'No Badge'}
                      </p>
                    </div>
                  </div>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin text-cyan" />}
                  {isCurrent && <span className="text-[10px] font-bold text-cyan uppercase tracking-wider pr-1">Current</span>}
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/5">
          <Button variant="secondary" onClick={onClose} className="px-4 py-2 text-xs rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
