import { X, FileSpreadsheet, FileDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { AnalyticsFilters } from '../types';
import { apiRequest } from '../../../utils/api';
import { useAuth } from '../../../store/AuthContext';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
}

export function ExportDialog({ isOpen, onClose, filters }: ExportDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  
  const API_BASE = '/server/ai-cios';

  if (!isOpen) return null;

  const handleExport = async (format: 'pdf' | 'csv') => {
    setDownloading(true);
    setSuccess(false);

    try {
      const reportFilters = {
        dateStart: filters.dateRange[0] || '',
        dateEnd: filters.dateRange[1] || '',
        district: filters.districts[0] || '',
        policeStation: filters.policeStations[0] || '',
        crimeCategory: filters.crimeCategories[0] || '',
        severity: filters.riskLevels[0] || '',
        status: filters.statuses[0] || '',
      };

      const res = await apiRequest<any>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Analytics Executive Summary',
          format,
          filters: reportFilters,
          officer: user?.name || 'Investigator'
        })
      });

      if (res.success) {
        const link = document.createElement('a');
        link.href = `${API_BASE}${res.downloadUrl}`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-bold text-white mb-1">Export Analytics Data</h3>
        <p className="text-xs text-slate-400 mb-4">Select format to export the filtered intelligence data.</p>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-green-400 gap-2">
            <CheckCircle className="w-12 h-12" />
            <span className="text-sm font-semibold">Export Complete!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={downloading}
              className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Export as CSV</span>
                <span className="text-xs text-slate-450 block">Best for spreadsheet analysis</span>
              </div>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              disabled={downloading}
              className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left"
            >
              <FileDown className="w-6 h-6 text-red-400" />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Export Executive PDF</span>
                <span className="text-xs text-slate-450 block">Formatted vector report charts</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
