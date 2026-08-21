import { X, FileSpreadsheet, FileDown, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { AnalyticsFilters } from '../types';
import { API_BASE_URL } from '../../../utils/api';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalyticsFilters;
}

export function ExportDialog({ isOpen, onClose, filters }: ExportDialogProps) {
  const [downloadingFormat, setDownloadingFormat] = useState<'csv' | 'pdf' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const buildQuery = (f: AnalyticsFilters): string => {
    const params = new URLSearchParams();
    if (f.dateRange[0]) params.append('dateFrom', f.dateRange[0]);
    if (f.dateRange[1]) params.append('dateTo', f.dateRange[1]);
    if (f.districts.length > 0) params.append('districts', f.districts.join(','));
    if (f.policeStations.length > 0) params.append('policeStations', f.policeStations.join(','));
    if (f.crimeCategories.length > 0) params.append('crimeCategories', f.crimeCategories.join(','));
    if (f.riskLevels.length > 0) params.append('riskLevels', f.riskLevels.join(','));
    if (f.statuses.length > 0) params.append('statuses', f.statuses.join(','));
    if (f.victimGender && f.victimGender !== 'All') params.append('victimGender', f.victimGender);
    if (f.accusedGender && f.accusedGender !== 'All') params.append('accusedGender', f.accusedGender);
    return params.toString();
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (downloadingFormat) return; // Prevent duplicate clicks

    setDownloadingFormat(format);
    setSuccessMessage(null);
    setErrorMessage(null);

    const query = buildQuery(filters);
    const endpoint = format === 'pdf' ? '/analytics/export-pdf' : '/analytics/export-csv';
    const url = `${API_BASE_URL}${endpoint}${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const json = await response.json();
          if (json.error) errDetail = json.error;
        } catch {
          // ignore
        }
        throw new Error(errDetail);
      }

      const contentType = response.headers.get('Content-Type') || '';
      if (format === 'pdf' && !contentType.includes('application/pdf')) {
        throw new Error('Server did not return a valid PDF binary.');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Downloaded file was empty.');
      }

      const blobUrl = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = format === 'pdf'
        ? `ai-cios-executive-report-${dateStr}.pdf`
        : `ai-cios-analytics-${dateStr}.csv`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setSuccessMessage(format === 'pdf' ? 'Executive PDF downloaded!' : 'CSV exported successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(`Export ${format.toUpperCase()} failed:`, err);
      setErrorMessage(`Unable to generate ${format.toUpperCase()}. Please try again.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={downloadingFormat !== null}
          className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Export Analytics Data</h3>
        <p className="text-xs text-slate-400 mb-4">Select format to export the filtered intelligence data.</p>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="flex flex-col items-center justify-center py-6 text-green-400 gap-2">
            <CheckCircle className="w-12 h-12 animate-pulse" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* CSV Button */}
            <button
              onClick={() => handleExport('csv')}
              disabled={downloadingFormat !== null}
              className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:border-emerald-500/40">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">
                    {downloadingFormat === 'csv' ? 'Exporting CSV…' : 'Export as CSV'}
                  </span>
                  <span className="text-xs text-slate-400 block">Best for spreadsheet analysis</span>
                </div>
              </div>
              {downloadingFormat === 'csv' && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
            </button>

            {/* PDF Button */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={downloadingFormat !== null}
              className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 group-hover:border-rose-500/40">
                  <FileDown className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-200 block">
                    {downloadingFormat === 'pdf' ? 'Generating Executive PDF…' : 'Export Executive PDF'}
                  </span>
                  <span className="text-xs text-slate-400 block">Formatted vector report charts</span>
                </div>
              </div>
              {downloadingFormat === 'pdf' && <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
