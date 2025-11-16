import { CalendarCheck, CloudRain, Navigation, Route } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { MissionControlPanel } from '@/modules/mission-control/MissionControlPanel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StageMetric } from '../components/StageMetric';
import { StagePanel } from '../components/StagePanel';

interface ScheduleStageProps {
  estimator: EstimatorState;
  missionControl: ReactNode;
}

export function ScheduleStage({ estimator, missionControl }: ScheduleStageProps) {
  const blackoutWindows = estimator.logistics.prepHours;

  return (
    <StagePanel
      title="Schedule & Deploy"
      eyebrow="Step 07"
      subtitle="Respect worship blackout windows, crew capacity, weather gates, and export mission briefs for field devices."
      tone="var(--stage-schedule)"
      toolbar={
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2">
            <CloudRain className="h-4 w-4" />
            Weather sync
          </Button>
          <Button type="button" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Publish schedule
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StageMetric
          label="Prep hours"
          value={`${estimator.logistics.prepHours || 0} hrs`}
          tone="neutral"
          hint="Includes sweeping, barricades, signage."
        />
        <StageMetric
          label="Blackout windows"
          value={blackoutWindows ? `${blackoutWindows} scheduled` : 'Set required'}
          tone={blackoutWindows ? 'positive' : 'warning'}
        />
        <StageMetric
          label="Crew distance"
          value={`${Math.round(estimator.job.distance).toLocaleString()} mi`}
          icon={<Route className="h-4 w-4" />}
          hint="Door-to-door logistics"
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Mission routing</p>
            <p className="text-xs text-white/60">Generate crew briefings with lane closures, hazard zones, and staging.</p>
          </div>
          <Button type="button" variant="secondary" className="gap-2">
            <Navigation className="h-4 w-4" />
            Export brief
          </Button>
        </div>
      </div>
      {missionControl ?? <MissionControlPanel estimator={estimator} />}
    </StagePanel>
  );
}
