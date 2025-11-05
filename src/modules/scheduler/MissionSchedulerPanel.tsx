import { startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';

import { AddMissionTaskForm } from './AddMissionTaskForm';
import { CrewCapacityCard } from './CrewCapacityCard';
import { MissionAlerts } from './MissionAlerts';
import { useMissionSchedulerContext } from './MissionSchedulerContext';
import { MissionTimeline } from './MissionTimeline';

import { BlackoutEditor } from '@/components/Scheduler/BlackoutEditor';
import { CrewAssign } from '@/components/Scheduler/CrewAssign';
import { WeatherAdvisor } from '@/components/Scheduler/WeatherAdvisor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MissionSchedulerPanelProps {
  coords: [number, number] | null;
}

export function MissionSchedulerPanel({ coords }: MissionSchedulerPanelProps) {
  const scheduler = useMissionSchedulerContext();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));

  const schedulerReady = scheduler.ready;

  const panelContent = useMemo(() => {
    if (!schedulerReady) {
      return (
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-3xl bg-slate-900/60" />
          <div className="h-[520px] animate-pulse rounded-3xl bg-slate-900/60" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />
            <div className="h-64 animate-pulse rounded-3xl bg-slate-900/60" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <AddMissionTaskForm />
        <MissionTimeline weekStart={weekStart} onShiftWeek={setWeekStart} />
        <div className="grid gap-6 lg:grid-cols-2">
          <MissionAlerts />
          <CrewCapacityCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <BlackoutEditor />
          <CrewAssign />
        </div>
        <WeatherAdvisor coords={coords} />
      </div>
    );
  }, [coords, schedulerReady, weekStart]);

  return (
    <div className="space-y-6">
      {scheduler.persistError ? (
        <Alert variant="destructive" className="border-red-500/40 bg-red-500/10 text-red-100">
          <AlertTitle>Scheduler Storage Issue</AlertTitle>
          <AlertDescription>
            Unable to persist mission planner state to local storage. Check browser storage quotas
            and retry.
          </AlertDescription>
        </Alert>
      ) : null}
      {panelContent}
    </div>
  );
}
