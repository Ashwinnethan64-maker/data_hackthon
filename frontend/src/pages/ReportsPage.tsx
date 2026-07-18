import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { apiRequest } from '../utils/api';
import { FileText, Download, Trash2, Loader2, AlertCircle, Filter, Table2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../store/AuthContext';

interface ReportFilters {
  crimeCategory: string;
  district: string;
  policeStation: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  severity: string;
}

export function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<{ pdf: boolean; csv: boolean }>({ pdf: false, csv: false });
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset } = useForm<ReportFilters>({
    defaultValues: {
      crimeCategory: '',
      district: '',
      policeStation: '',
      dateStart: '',
      dateEnd: '',
      status: '',
      severity: ''
    }
  });

  const currentFilters = watch();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<any[]>('/reports');
      setReports(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = async (format: 'pdf' | 'csv') => {
    setGenerating(prev => ({ ...prev, [format]: true }));
    setError(null);
    try {
      const res = await apiRequest<any>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'Comprehensive Summary',
          format,
          filters: currentFilters,
          officer: user?.name || 'Investigator'
        })
      });
      if (res.success) {
        // Trigger download
        const link = document.createElement('a');
        link.href = `${API_BASE}${res.downloadUrl}`;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        fetchReports(); // Refresh history
      }
    } catch (err: any) {
      setError(err.message || `Failed to generate ${format.toUpperCase()} report`);
    } finally {
      setGenerating(prev => ({ ...prev, [format]: false }));
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

  const onSubmit = (data: ReportFilters) => {
    // Called when form is submitted natively (e.g. hitting Enter)
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">Intelligence Reports</h1>
        <p className="mt-2 text-sm md:text-base text-slate-400">Generate, view, and export formal case summaries based on multiple criteria.</p>
      </header>

      {error && (
        <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg flex items-center gap-2 text-sm md:text-base" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Generator Form */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-cyan" />
              <h2 className="text-xl font-semibold text-white">Report Configuration</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Crime Category</label>
                  <select {...register('crimeCategory')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition">
                    <option value="">All Categories</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Narcotics">Narcotics</option>
                    <option value="Violent Crime">Violent Crime</option>
                    <option value="Property Crime">Property Crime</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">District</label>
                  <select {...register('district')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition">
                    <option value="">All Districts</option>
                    <option value="Bengaluru Urban">Bengaluru Urban</option>
                    <option value="Mysuru">Mysuru</option>
                    <option value="Mangaluru">Mangaluru</option>
                    <option value="Hubballi">Hubballi</option>
                    <option value="Belagavi">Belagavi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Police Station</label>
                  <input type="text" placeholder="e.g. Central Station" {...register('policeStation')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition placeholder:text-slate-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Start Date</label>
                  <input type="date" {...register('dateStart')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">End Date</label>
                  <input type="date" {...register('dateEnd')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Case Status</label>
                  <select {...register('status')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition">
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Closed">Closed</option>
                    <option value="Pending Trial">Pending Trial</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Severity</label>
                  <select {...register('severity')} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan transition">
                    <option value="">All Severities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10 mt-6 justify-end">
                <Button type="button" onClick={() => reset()} variant="secondary" className="w-full sm:w-auto">
                  Reset Filters
                </Button>
                <Button type="button" onClick={() => generateReport('csv')} disabled={generating.csv || generating.pdf} variant="secondary" className="w-full sm:w-auto hover:bg-cyan/20 hover:text-cyan border-cyan/30">
                  {generating.csv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Generate CSV
                </Button>
                <Button type="button" onClick={() => generateReport('pdf')} disabled={generating.csv || generating.pdf} className="w-full sm:w-auto bg-cyan hover:bg-cyan/90 text-navy">
                  {generating.pdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Generate PDF Report
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="h-full min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <Table2 className="w-5 h-5 text-police" />
              <h2 className="text-xl font-semibold text-white">Recent Exports</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white/5 rounded-lg border border-white/5 border-dashed">
                <p className="text-sm">No reports generated yet.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
                {reports.map((report) => (
                  <div key={report.ROWID || report.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan" />
                        <span className="font-medium text-sm text-slate-200 line-clamp-1" title={report.reportType}>{report.reportType}</span>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-xs text-slate-400">By {report.officer}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`${API_BASE}${report.downloadUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/10 rounded hover:bg-cyan hover:text-navy text-slate-300 transition"
                          title="Download"
                          aria-label={`Download ${report.reportType}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => deleteReport(report.ROWID || report.id)}
                          className="p-1.5 bg-white/10 rounded hover:bg-danger text-slate-300 hover:text-white transition"
                          title="Delete"
                          aria-label={`Delete ${report.reportType}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
