import ReactECharts from 'echarts-for-react';

export function SociologicalChart() {
  const categories = ['Low Income', 'Medium Income', 'High Income', 'No Education', 'Secondary Ed', 'Higher Ed'];
  const values = [54, 32, 14, 45, 38, 17];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
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
      type: 'category',
      data: categories,
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
    },
    series: [
      {
        name: 'Sociological Correlates (%)',
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#8b5cf6',
          borderRadius: 4
        }
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Sociological Analysis (Income & Education Correlates)</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
