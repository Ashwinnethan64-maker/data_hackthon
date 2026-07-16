import ReactECharts from 'echarts-for-react';

export function RepeatOffenderChart() {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    radar: {
      indicator: [
        { name: 'Bengaluru Urban', max: 100 },
        { name: 'Mysuru', max: 100 },
        { name: 'Mangaluru', max: 100 },
        { name: 'Hubballi', max: 100 },
        { name: 'Belagavi', max: 100 }
      ],
      axisName: { color: '#94a3b8' },
      splitArea: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
    },
    series: [
      {
        name: 'Repeat Offender Density',
        type: 'radar',
        data: [
          {
            value: [85, 45, 60, 30, 50],
            name: 'Offender Density Index',
            areaStyle: { color: 'rgba(239,68,68,0.2)' },
            lineStyle: { color: '#ef4444' },
            itemStyle: { color: '#ef4444' }
          }
        ]
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Repeat Offender Hotspots Radar</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
