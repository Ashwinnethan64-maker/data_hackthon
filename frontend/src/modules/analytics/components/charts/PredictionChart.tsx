import ReactECharts from 'echarts-for-react';

interface PredictionChartProps {
  forecastData: { month: string; actual: number | null; forecast: number }[];
}

export function PredictionChart({ forecastData }: PredictionChartProps) {
  const months = forecastData.map((d) => d.month);
  const actuals = forecastData.map((d) => d.actual);
  const forecasts = forecastData.map((d) => d.forecast);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      textStyle: { color: '#94a3b8' }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
    },
    series: [
      {
        name: 'Actual Crimes',
        type: 'line',
        data: actuals,
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Forecast Model (AI)',
        type: 'line',
        data: forecasts,
        itemStyle: { color: '#f59e0b' },
        lineStyle: { type: 'dashed', width: 2 }
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Predictive Crime Forecasting (9-Month Horizon)</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
