import ReactECharts from 'echarts-for-react';
import type { Officer } from '../../types';
import { useMemo } from 'react';
import { UserCheck } from 'lucide-react';

interface OfficerPerformanceChartProps {
  officers: Officer[];
}

export function OfficerPerformanceChart({ officers = [] }: OfficerPerformanceChartProps) {
  // Ensure we display up to 6 officers with meaningful activity
  const topOfficers = useMemo(() => {
    return officers
      .filter((o) => o && o.name)
      .slice(0, 6);
  }, [officers]);

  const names = topOfficers.map((o) => o.name);
  const assigned = topOfficers.map((o) => o.casesAssigned || 0);
  const solved = topOfficers.map((o) => o.casesSolved || 0);

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#0f172a',
        borderColor: 'rgba(148,163,184,0.15)',
        textStyle: { color: '#e2e8f0' }
      },
      legend: {
        data: ['Assigned Cases', 'Solved Cases'],
        textStyle: { color: '#94a3b8', fontSize: 11 },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10,
          interval: 0,
          rotate: names.length > 4 ? 20 : 0
        },
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } }
      },
      series: [
        {
          name: 'Assigned Cases',
          type: 'bar',
          data: assigned,
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 28
        },
        {
          name: 'Solved Cases',
          type: 'bar',
          data: solved,
          itemStyle: {
            color: '#10b981',
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 28
        }
      ]
    };
  }, [names, assigned, solved]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Officer Performance Comparison</h3>
        </div>
        <span className="text-[10px] text-slate-400 uppercase font-mono">
          {topOfficers.length} Officers Ranked
        </span>
      </div>

      {topOfficers.length === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
          <UserCheck className="w-6 h-6 text-slate-500 opacity-60" />
          <span>No officer caseload data available for the active filter set.</span>
        </div>
      ) : (
        <div className="h-[280px] w-full min-h-[260px]">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      )}
    </div>
  );
}
