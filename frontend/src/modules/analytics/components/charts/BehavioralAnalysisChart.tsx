import ReactECharts from 'echarts-for-react';

export function BehavioralAnalysisChart() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'];

  // Mock heatmap matrix [dayIndex, timeIndex, value]
  const data = [
    [0, 0, 15], [0, 5, 24], [4, 4, 30], [4, 5, 45],
    [5, 0, 48], [5, 5, 52], [6, 0, 40], [6, 5, 42]
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: days,
      splitLine: { show: true },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'category',
      data: times,
      splitLine: { show: true },
      axisLabel: { color: '#94a3b8' }
    },
    visualMap: {
      min: 0,
      max: 60,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['rgba(6,182,212,0.1)', '#06b6d4', '#1d4ed8']
      },
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        name: 'Incident Density',
        type: 'heatmap',
        data: data.map((item) => [item[0], item[1], item[2]]),
        label: { show: true, color: '#fff' },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="h-[320px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Behavioral Heatmap (Day of Week vs Time)</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
