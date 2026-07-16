import { KPISection } from './KPISection';
import { CrimeTrendChart } from './charts/CrimeTrendChart';
import { DistrictComparisonChart } from './charts/DistrictComparisonChart';
import { CrimeCategoryChart } from './charts/CrimeCategoryChart';
import { OfficerPerformanceChart } from './charts/OfficerPerformanceChart';
import { RepeatOffenderChart } from './charts/RepeatOffenderChart';
import { BehavioralAnalysisChart } from './charts/BehavioralAnalysisChart';
import { PredictionPanel } from './PredictionPanel';
import { AnomalyPanel } from './AnomalyPanel';
import { HotspotRankingChart } from './charts/HotspotRankingChart';
import { SociologicalChart } from './charts/SociologicalChart';
import { AnomalyChart } from './charts/AnomalyChart';
import { InsightCard } from './InsightCard';
import type { FIR, Officer, KPIData, AIInsight, AnomalyAlert } from '../types';
import { BrainCircuit, Loader2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  kpis: KPIData;
  filteredFirs: FIR[];
  filteredOfficers: Officer[];
  forecastData: { month: string; actual: number | null; forecast: number }[];
  anomalies: AnomalyAlert[];
  aiInsights: AIInsight[];
  isGeneratingAI: boolean;
}

export function AnalyticsDashboard({
  kpis,
  filteredFirs,
  filteredOfficers,
  forecastData,
  anomalies,
  aiInsights,
  isGeneratingAI
}: AnalyticsDashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Section 1: KPI Cards */}
      <KPISection kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (2 cols wide on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 2: Crime Trends */}
          <CrimeTrendChart firs={filteredFirs} />

          {/* Section 3: Crime Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistrictComparisonChart firs={filteredFirs} />
            <CrimeCategoryChart firs={filteredFirs} />
          </div>

          {/* Section 4: Hotspot Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HotspotRankingChart />
            <BehavioralAnalysisChart />
          </div>

          {/* Section 5: Repeat Offenders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RepeatOffenderChart />
            <SociologicalChart />
          </div>

          {/* Section 6: Officer Performance */}
          <OfficerPerformanceChart officers={filteredOfficers} />

          {/* Section 9: Predictive Intelligence */}
          <PredictionPanel forecastData={forecastData} />
        </div>

        {/* Right Col (AI insights & anomalies) */}
        <div className="space-y-6">
          {/* AI Insights Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-350 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              AI Investigator Copilot
            </h3>

            {isGeneratingAI && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 text-police animate-spin" />
                <span className="text-xs font-semibold">Running pattern matchers...</span>
              </div>
            )}

            {!isGeneratingAI && aiInsights.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                Click "Generate AI Insights" above to invoke copilot recommendations.
              </div>
            )}

            {!isGeneratingAI && aiInsights.length > 0 && (
              <div className="flex flex-col gap-3">
                {aiInsights.map((ins) => (
                  <InsightCard key={ins.id} insight={ins} />
                ))}
              </div>
            )}
          </div>

          {/* Section 10: Anomalies */}
          <AnomalyPanel anomalies={anomalies} />

          {/* Section 10: Risk index Gauge */}
          <AnomalyChart />
        </div>
      </div>
    </div>
  );
}
