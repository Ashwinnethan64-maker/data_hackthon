import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface PredictionChartProps {
  forecastData: { month: string; actual: number | null; forecast: number | null }[];
}

export function PredictionChart({ forecastData = [] }: PredictionChartProps) {
  const months = forecastData.map((d) => d.month);
  const actuals = forecastData.map((d) => d.actual);
  const forecasts = forecastData.map((d) => d.forecast);

  const hasData = forecastData.length > 0;

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: 'rgba(148,163,184,0.15)',
        textStyle: { color: '#e2e8f0' },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          let res = `<div style="font-weight:bold;margin-bottom:4px;color:#fff">${params[0].axisValue}</div>`;
          params.forEach((item) => {
            if (item.value !== null && item.value !== undefined) {
              res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px">
                <span style="color:${item.color}">${item.seriesName}:</span>
                <span style="font-weight:bold;color:#fff">${item.value} Incidents</span>
              </div>`;
            }
          });
          return res;
        }
      },
      legend: {
        data: ['Actual Crimes', 'Forecast Model (AI)'],
        textStyle: { color: '#94a3b8', fontSize: 11 },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { color: '#94a3b8', fontSize: 10, interval: 0, rotate: months.length > 8 ? 25 : 0 }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
      },
      series: [
        {
          name: 'Actual Crimes',
          type: 'line',
          data: actuals,
          itemStyle: { color: '#06b6d4' },
          lineStyle: { width: 3 },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          name: 'Forecast Model (AI)',
          type: 'line',
          data: forecasts,
          itemStyle: { color: '#f59e0b' },
          lineStyle: { type: 'dashed', width: 2.5 },
          symbol: 'diamond',
          symbolSize: 6
        }
      ]
    };
  }, [months, actuals, forecasts]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Predictive Crime Forecasting (9-Month Horizon)</h3>
        </div>
        <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          Zia ML Projection
        </span>
      </div>

      {!hasData ? (
        <div className="h-[260px] flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
          <TrendingUp className="w-6 h-6 text-slate-500 opacity-60" />
          <span>Insufficient historical data to generate a reliable 9-month forecast.</span>
        </div>
      ) : (
        <div className="h-[280px] w-full min-h-[260px]">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}
    </div>
  );
}
