import ReactECharts from 'echarts-for-react';
import type { FIR } from '../../types';

interface DistrictComparisonChartProps {
  firs: FIR[];
}

export function DistrictComparisonChart({ firs }: DistrictComparisonChartProps) {
  const districtData: Record<string, number> = {};
  firs.forEach((f) => {
    districtData[f.district] = (districtData[f.district] || 0) + 1;
  });

  const sortedDistricts = Object.entries(districtData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const districts = sortedDistricts.map((d) => d[0]);
  const counts = sortedDistricts.map((d) => d[1]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
    },
    yAxis: {
      type: 'category',
      data: districts,
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: 'Total Crimes',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1d4ed8' },
              { offset: 1, color: '#06b6d4' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        }
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">District Crime Volume (Top 10)</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
