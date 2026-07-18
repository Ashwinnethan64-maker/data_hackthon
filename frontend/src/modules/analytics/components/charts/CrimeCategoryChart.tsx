import ReactECharts from 'echarts-for-react';
import type { FIR } from '../../types';

interface CrimeCategoryChartProps {
  firs: FIR[];
}

export function CrimeCategoryChart({ firs }: CrimeCategoryChartProps) {
  const categoryData: Record<string, number> = {};
  firs.forEach((f) => {
    categoryData[f.crimeCategory] = (categoryData[f.crimeCategory] || 0) + 1;
  });

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#94a3b8' },
      type: 'scroll'
    },
    series: [
      {
        name: 'Crime Category',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#0f172a',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Crime Categories Distribution</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
