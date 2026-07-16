import ReactECharts from 'echarts-for-react';

export function AnomalyChart() {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    series: [
      {
        name: 'Risk Index Gauge',
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, '#10b981'],
              [0.7, '#f59e0b'],
              [1, '#ef4444']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,20c0.4,0.7,0.2,1.5-0.5,1.9c-0.2,0.1-0.4,0.2-0.7,0.2H1.4c-0.8,0-1.5-0.7-1.5-1.5c0-0.3,0.1-0.5,0.2-0.7l12-20C12.5,0.1,12.6,0.1,12.8,0.7z',
          width: 8,
          length: '50%',
          offsetCenter: [0, '5%'],
          itemStyle: { color: 'auto' }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 10, distance: -40 },
        title: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 'bold',
          offsetCenter: [0, '-10%']
        },
        data: [{ value: 74, name: 'Risk Level' }]
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Platform Risk Index Gauge</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
