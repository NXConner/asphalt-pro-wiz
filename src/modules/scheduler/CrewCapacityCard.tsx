import { format } from 'date-fns';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

import { useMissionSchedulerContext } from './MissionSchedulerContext';

export function CrewCapacityCard() {
  const { capacityPerShift, capacityTimeline, setCapacityPerShift } = useMissionSchedulerContext();
  const [pendingCapacity, setPendingCapacity] = useState<number>(capacityPerShift);

  const { peakUsage, avgUtilization, overloadedSlots } = useMemo(() => {
    if (capacityTimeline.length === 0) {
      return { peakUsage: 0, avgUtilization: 0, overloadedSlots: [] as typeof capacityTimeline };
    }
    const peak = capacityTimeline.reduce((max, snapshot) => Math.max(max, snapshot.crewScheduled), 0);
    const total = capacityTimeline.reduce((sum, snapshot) => sum + snapshot.crewScheduled, 0);
    const avg = total / (capacityTimeline.length * Math.max(1, capacityPerShift));
    const overload = capacityTimeline.filter((snapshot) => snapshot.crewScheduled > capacityPerShift);
    return {
      peakUsage: peak,
      avgUtilization: Math.min(1, Number(avg.toFixed(2))),
      overloadedSlots: overload,
    };
  }, [capacityTimeline, capacityPerShift]);

  const utilizationPercent = Math.round(avgUtilization * 100);
  const utilizationTone = utilizationPercent >= 95 ? 'bg-red-500/80' : utilizationPercent >= 70 ? 'bg-amber-400/80' : 'bg-emerald-400/80';

  return (
    <Card className="h-full border-white/10 bg-slate-950/70">
      <CardHeader className="space-y-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-100">
          Crew Capacity & Load Forecast
        </CardTitle>
        <p className="text-xs text-slate-300/80">
          Monitor utilization vs. the 3-person core crew. Adjust capacity as you onboard seasonal helpers.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200">
            <span>Average Utilization</span>
            <span>{utilizationPercent}%</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`absolute inset-y-0 left-0 ${utilizationTone}`}
              style={{ width: `${Math.min(100, utilizationPercent)}%` }}
            />
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
            Peak load hits {peakUsage} crew members this sprint.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200">
            <span>Crew Capacity Per Shift</span>
            <span>{capacityPerShift} crew</span>
          </div>
          <Slider
            value={[pendingCapacity]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setPendingCapacity(value[0] ?? capacityPerShift)}
          />
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
            <span>Two full-time + one part-time = 3 baseline</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCapacityPerShift(pendingCapacity)}
              disabled={pendingCapacity === capacityPerShift}
            >
              Update
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-200">
            <span>Overload Windows</span>
            <span>{overloadedSlots.length}</span>
          </div>
          {overloadedSlots.length === 0 ? (
            <p className="rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-300/70">
              No overloads detected. Missions within crew bandwidth.
            </p>
          ) : (
            <div className="space-y-2">
              {overloadedSlots.slice(0, 6).map((slot) => (
                <div
                  key={slot.slot}
                  className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-red-100"
                >
                  {format(new Date(slot.slot), 'MMM d, h:mma')} • {slot.crewScheduled} / {slot.capacity}
                </div>
              ))}
              {overloadedSlots.length > 6 ? (
                <p className="text-[11px] uppercase tracking-[0.25em] text-red-100/80">
                  +{overloadedSlots.length - 6} additional overload windows.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

