import { X, FileSpreadsheet, FileDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = (type: string) => {
    setDownloading(true);
    setSuccess(false);
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
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
