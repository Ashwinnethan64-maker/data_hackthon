import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { apiRequest } from '../utils/api';
import { FileText, Download, Trash2, Loader2, AlertCircle } from 'lucide-react';

export function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>('/reports');
      setReports(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = async (format: 'pdf' | 'csv') => {
    setGenerating(true);
    try {
      const res = await apiRequest<any>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Comprehensive Summary',
          format,
          filters: {}, // Add any relevant filters if needed
        })
      });
      if (res.success) {
        fetchReports();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await apiRequest(`/reports/${id}`, { method: 'DELETE' });
      fetchReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const API_BASE = '/server/ai-cios';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Intelligence Reports</h1>
        <p className="mt-2 text-slate-400">Generate, view, and export formal case summaries and analytics.</p>
      </header>

      {error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Generate New Report</h2>
            <p className="text-sm text-slate-400 mt-1">Create a comprehensive case summary based on current data.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => generateReport('csv')} disabled={generating} variant="secondary">
              {generating && !error ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Export CSV
            </Button>
            <Button onClick={() => generateReport('pdf')} disabled={generating}>
              {generating && !error ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Report History</h2>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-cyan" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center p-8 text-slate-400">
            No reports generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-sm font-medium text-slate-300">Type</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-300">Date</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-300">Officer</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.ROWID} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan" />
                        <span className="font-medium text-slate-200">{report.reportType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">{report.officer}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`${API_BASE}${report.downloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/5 rounded hover:bg-white/10 text-cyan transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteReport(report.ROWID || report.id)}
                          className="p-2 bg-white/5 rounded hover:bg-danger/20 text-danger transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
