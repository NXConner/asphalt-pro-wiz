import { Calendar, Map, PhoneCall, Ruler, Zap } from 'lucide-react';

import { StageMetric } from './StageMetric';

import type { WorkflowMissionMeta } from '../types';

interface WorkflowSummaryPanelProps {
  mission: WorkflowMissionMeta;
}

export function WorkflowSummaryPanel({ mission }: WorkflowSummaryPanelProps) {
  const metrics = [
    {
      label: 'Total Square Feet',
      value: mission.totalArea ? `${mission.totalArea.toLocaleString()} ft²` : 'Pending',
      icon: <Ruler className="h-4 w-4" />,
    },
    {
      label: 'Crack Footage',
      value: `${mission.crackFootage.toLocaleString()} lf`,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: 'Phase',
      value: mission.phaseLabel,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex flex-col gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/55">
          Mission Summary
        </p>
        <h3 className="text-xl font-semibold text-white">{mission.jobName}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-2">
            <Map className="h-4 w-4 text-white/50" />
            {mission.campus}
          </span>
          <span className="inline-flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-white/50" />
            {mission.contact}
          </span>
        </div>
        <p className="text-xs text-white/55">Status: {mission.status}</p>
        <p className="text-xs text-white/40">
          Last refreshed {new Date(mission.lastUpdatedIso).toLocaleString()}
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StageMetric key={metric.label} label={metric.label} value={metric.value} icon={metric.icon} />
        ))}
      </div>
    </div>
  );
}
