import { BrainCircuit, Info } from 'lucide-react';
import { PredictionChart } from './charts/PredictionChart';

interface PredictionPanelProps {
  forecastData: { month: string; actual: number | null; forecast: number }[];
}

export function PredictionPanel({ forecastData }: PredictionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-police/20 to-cyan-500/10 border border-police/30 rounded-xl flex items-start gap-3">
        <BrainCircuit className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">AI Forecasting Engine Active</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform utilizes historical crime trends, cyclical correlations, and weather indices to model prospective crime rates for the coming quarters. Currently predicting high stability with moderate localized growth in urban centers.
          </p>
        </div>
      </div>
      <PredictionChart forecastData={forecastData} />
    </div>
  );
}
