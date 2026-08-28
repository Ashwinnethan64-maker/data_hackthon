import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { FIR } from '../../types';
import { Flame } from 'lucide-react';

interface HotspotRankingChartProps {
  firs?: FIR[];
}

export function HotspotRankingChart({ firs = [] }: HotspotRankingChartProps) {
  const option = useMemo(() => {
    const districtStationMap: Record<string, Record<string, number>> = {};

    firs.forEach((f) => {
      const dist = f.district || 'Other District';
      const station = f.policeStation || 'Station Area';

      if (!districtStationMap[dist]) {
        districtStationMap[dist] = {};
      }
      districtStationMap[dist][station] = (districtStationMap[dist][station] || 0) + 1;
    });

    const treeData = Object.entries(districtStationMap).map(([district, stations]) => {
      const children = Object.entries(stations).map(([station, count]) => ({
        name: station,
        value: count
      }));
      const totalDist = children.reduce((acc, c) => acc + c.value, 0);
      return {
        name: district,
        value: totalDist,
        children
      };
    });

    return {
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
          visibleMin: 1,
          label: {
            show: true,
            formatter: '{b}: {c}'
          },
          itemStyle: {
            borderColor: '#0f172a',
            borderWidth: 2,
            gapWidth: 1
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#020617',
                borderWidth: 2,
                gapWidth: 1
              }
            },
            {
              colorSaturation: [0.35, 0.6],
              itemStyle: {
                borderColorSaturation: 0.7,
                gapWidth: 1
              }
            }
          ],
          data: treeData
        }
      ]
    };
  }, [firs]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-slate-200">Crime Hotspot Intensity Treemap</h3>
        </div>
      </div>
      <div className="h-[280px] w-full min-h-[260px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
