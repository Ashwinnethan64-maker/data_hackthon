import ReactECharts from 'echarts-for-react';

export function HotspotRankingChart() {
  const data = [
    {
      name: 'Bengaluru Urban',
      value: 180,
      children: [
        { name: 'Koramangala', value: 80 },
        { name: 'Whitefield', value: 60 },
        { name: 'Indiranagar', value: 40 }
      ]
    },
    {
      name: 'Mysuru',
      value: 90,
      children: [
        { name: 'Devaraja', value: 50 },
        { name: 'Vidyaranyapuram', value: 40 }
      ]
    },
    {
      name: 'Kalaburagi',
      value: 70,
      children: [
        { name: 'Station Bazar', value: 70 }
      ]
    }
  ];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: 'rgba(148,163,184,0.15)',
      textStyle: { color: '#e2e8f0' }
    },
    series: [
      {
        name: 'Hotspots Treemap',
        type: 'treemap',
        visibleMin: 300,
        label: {
          show: true,
          formatter: '{b}'
        },
        itemStyle: {
          borderColor: '#0f172a'
        },
        data: data
      }
    ]
  };

  return (
    <div className="h-[300px] w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Crime Hotspot Intensity Treemap</h3>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
