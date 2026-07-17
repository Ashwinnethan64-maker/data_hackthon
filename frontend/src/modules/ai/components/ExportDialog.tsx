import { useState } from 'react';
import { X, FileDown, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SharedModal } from './SharedModal';
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
}

export function ExportDialog({ isOpen, onClose, messages }: ExportDialogProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = (format: string) => {
    setDownloading(true);
    setSuccess(false);
    
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      
      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('AI Investigation Thread', 10, 20);
        doc.setFontSize(10);
        let y = 30;
        
        messages.forEach(m => {
          const lines = doc.splitTextToSize(`[${m.role.toUpperCase()}] (${m.timestamp}): ${m.content}`, 180);
          if (y + lines.length * 5 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(lines, 10, y);
          y += lines.length * 5 + 5;
        });
        
        doc.save('AI-Investigation-Thread.pdf');
      } else {
        const content = messages.map(m => `[${m.role.toUpperCase()}] (${m.timestamp}):\n${m.content}\n`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI-Investigation-Thread.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Export Conversation">
      {success ? (
        <div className="flex flex-col items-center justify-center py-6 text-green-400 gap-2">
          <CheckCircle2 className="w-12 h-12 animate-bounce" />
          <span className="text-sm font-semibold">Transcript exported successfully!</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleExport('txt')}
            disabled={downloading}
            className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left"
          >
            <FileDown className="w-6 h-6 text-cyan-400" />
            <div>
              <span className="text-sm font-medium text-slate-200 block">Export as Text Log (.txt)</span>
              <span className="text-xs text-slate-450 block">Best for fast case logs copying</span>
            </div>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={downloading}
            className="flex items-center gap-3 p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all disabled:opacity-50 text-left"
          >
            <FileDown className="w-6 h-6 text-red-400" />
            <div>
              <span className="text-sm font-medium text-slate-200 block">Export Executive PDF (.pdf)</span>
              <span className="text-xs text-slate-450 block">Official case-ready layout</span>
            </div>
          </button>
        </div>
      )}
    </SharedModal>
  );
}
