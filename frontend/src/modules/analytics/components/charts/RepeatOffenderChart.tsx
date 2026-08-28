import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { FIR } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface RepeatOffenderChartProps {
  firs?: FIR[];
}

export function RepeatOffenderChart({ firs = [] }: RepeatOffenderChartProps) {
  const option = useMemo(() => {
    // Group repeat offenders or active incidents by district
    const districts = ['Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'];
    const districtScores = districts.map((d) => {
      const match = firs.filter((f) => f.district === d);
      return Math.min(100, Math.max(15, match.length * 18 + 20));
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0f172a',
        borderColor: 'rgba(148,163,184,0.15)',
        textStyle: { color: '#e2e8f0' }
      },
      radar: {
        indicator: districts.map((d) => ({ name: d, max: 100 })),
        axisName: { color: '#94a3b8', fontSize: 10 },
        splitArea: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
      },
      series: [
        {
          name: 'Repeat Offender Density',
          type: 'radar',
          data: [
            {
              value: districtScores,
              name: 'Offender Density Index',
              areaStyle: { color: 'rgba(239,68,68,0.25)' },
              lineStyle: { color: '#ef4444', width: 2 },
              itemStyle: { color: '#ef4444' }
            }
          ]
        }
      ]
    };
  }, [firs]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-slate-200">Repeat Offender Hotspots Radar</h3>
        </div>
      </div>
      <div className="h-[280px] w-full min-h-[260px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
    </div>
  );
}
