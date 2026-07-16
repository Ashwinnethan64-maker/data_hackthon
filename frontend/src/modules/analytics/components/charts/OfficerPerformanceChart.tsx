import ReactECharts from 'echarts-for-react';
import type { Officer } from '../../types';

interface OfficerPerformanceChartProps {
  officers: Officer[];
}

export function OfficerPerformanceChart({ officers }: OfficerPerformanceChartProps) {
  const topOfficers = officers.slice(0, 5);

  const names = topOfficers.map((o) => o.name);
  const assigned = topOfficers.map((o) => o.casesAssigned);
  const solved = topOfficers.map((o) => o.casesSolved);

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
      data: names,
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
    },
    series: [
      {
        name: 'Assigned Cases',
        type: 'bar',
        data: assigned,
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: 'Solved Cases',
        type: 'bar',
        data: solved,
        itemStyle: { color: '#10b981' }
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Officer Performance Comparison</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
