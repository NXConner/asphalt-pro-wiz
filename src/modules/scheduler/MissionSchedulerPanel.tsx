import { startOfWeek } from 'date-fns';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Cloud, CloudOff, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { AddMissionTaskForm } from './AddMissionTaskForm';
import { CrewCapacityCard } from './CrewCapacityCard';
import { MissionAlerts } from './MissionAlerts';
import { MissionTimeline } from './MissionTimeline';
import { useMissionSchedulerContext } from './useMissionSchedulerContext';

import { BlackoutEditor } from '@/components/Scheduler/BlackoutEditor';
import { CrewAssign } from '@/components/Scheduler/CrewAssign';
import { WeatherAdvisor } from '@/components/Scheduler/WeatherAdvisor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { schedulerSyncAvailable } from '@/modules/scheduler/persistence';

interface MissionSchedulerPanelProps {
  coords: [number, number] | null;
}

export function MissionSchedulerPanel({ coords }: MissionSchedulerPanelProps) {
  const scheduler = useMissionSchedulerContext();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [icsImporting, setIcsImporting] = useState(false);
  const [icsSummary, setIcsSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const schedulerReady = scheduler.ready;
  const supabaseEnabled = schedulerSyncAvailable();
  const taskCount = scheduler.tasks.length;
  const crewCount = scheduler.crewMembers.length;
  const blackoutCount = scheduler.blackouts.length;

  const handleIcsFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!schedulerReady) {
        toast.error('Mission scheduler is still loading. Please try again in a moment.');
        event.target.value = '';
        return;
      }

      setIcsImporting(true);
      try {
        const text = await file.text();
        const result = scheduler.importBlackoutsFromICS(text);
        setIcsSummary(
          `Imported ${result.totalEvents} worship events • ${result.created} new • ${result.updated} refreshed`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to import worship calendar file.',
        );
      } finally {
        setIcsImporting(false);
        event.target.value = '';
      }
    },
    [scheduler, schedulerReady],
  );

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
        <Card className="border-slate-800/70 bg-slate-950/60 backdrop-blur">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mission Sync Center</CardTitle>
              <CardDescription>
                Keep the crew schedule and worship blackout windows synced across every device.
              </CardDescription>
            </div>
            <Badge
              variant={supabaseEnabled ? 'default' : 'outline'}
              className="flex items-center gap-1 text-xs uppercase tracking-wide"
            >
              {supabaseEnabled ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <CloudOff className="h-4 w-4 text-yellow-400" />
              )}
              {supabaseEnabled ? 'Supabase Connected' : 'Offline Draft Mode'}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-200">
              <div>
                <span className="font-semibold text-slate-50">{taskCount}</span>{' '}
                scheduled missions
              </div>
              <div>
                <span className="font-semibold text-slate-50">{crewCount}</span> active crews
              </div>
              <div>
                <span className="font-semibold text-slate-50">{blackoutCount}</span> blackout windows
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Label htmlFor="ics-file-upload" className="sr-only">
                Import Worship Calendar File
              </Label>
              <input
                id="ics-file-upload"
                ref={fileInputRef}
                type="file"
                accept=".ics,text/calendar"
                className="hidden"
                onChange={handleIcsFileChange}
                aria-label="Import worship calendar file (.ics format)"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={icsImporting || !schedulerReady}
              >
                <Upload className="mr-2 h-4 w-4" />
                {icsImporting ? 'Importing…' : 'Import Worship Calendar (.ics)'}
              </Button>
              <span className="text-xs text-slate-400">
                {icsSummary ??
                  (supabaseEnabled
                    ? 'Synced with mission_tasks & crew blackout tables'
                    : 'Local-only until Supabase credentials are configured')}
              </span>
            </div>
          </CardContent>
        </Card>
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
    }, [
      blackoutCount,
      coords,
      crewCount,
      handleIcsFileChange,
      icsImporting,
      icsSummary,
      schedulerReady,
      supabaseEnabled,
      taskCount,
      weekStart,
    ]);

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
