import { addHours, addMinutes, startOfHour } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useMissionSchedulerContext } from './useMissionSchedulerContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  CrewMember,
  MissionTaskPriority,
  MissionTaskStatus,
} from '@/modules/scheduler/types';
import { listJobs, type SavedJob } from '@/lib/idb';

interface MissionTaskDraft {
  jobName: string;
  site: string;
  start: string;
  durationHours: number;
  crewRequired: number;
  crewAssigned: string[];
  accessibilityImpact: 'entrance' | 'parking' | 'mobility' | 'auditorium' | 'walkway' | 'none';
  priority: MissionTaskPriority;
  status: MissionTaskStatus;
  notes: string;
}

interface JobSuggestion {
  id: string;
  name: string;
  address: string;
  status: string;
}

function formatDateTimeLocal(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function nextMissionStart(): Date {
  const now = new Date();
  const base = startOfHour(now);
  base.setMinutes(0, 0, 0);
  const candidate = addHours(base, 2);
  candidate.setMinutes(0, 0, 0);
  if (candidate.getHours() < 6) {
    candidate.setHours(7);
  }
  return candidate;
}

export function AddMissionTaskForm({ defaultStart = nextMissionStart() }: { defaultStart?: Date }) {
  const { addTask, assignCrew, crewMembers, capacityPerShift } = useMissionSchedulerContext();

  const [draft, setDraft] = useState<MissionTaskDraft>(() => ({
    jobName: '',
    site: '',
    start: formatDateTimeLocal(defaultStart),
    durationHours: 4,
    crewRequired: Math.min(capacityPerShift, 3),
    crewAssigned: [],
    accessibilityImpact: 'none',
    priority: 'standard',
    status: 'scheduled',
    notes: '',
  }));
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestion[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === 'undefined') return () => {};
    setIsLoadingJobs(true);
    listJobs()
      .then((jobs: SavedJob[]) => {
        if (cancelled) return;
        const suggestions: JobSuggestion[] = jobs.slice(0, 25).map((job) => ({
          id: job.id,
          name: job.name || 'Untitled mission',
          address: job.address,
          status: job.status,
        }));
        setJobSuggestions(suggestions);
      })
      .catch(() => {
        setJobSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingJobs(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const crewOptions = useMemo(() => crewMembers ?? [], [crewMembers]);

  const handleSelectSuggestion = (suggestion: JobSuggestion) => {
    setDraft((prev) => ({
      ...prev,
      jobName: suggestion.name,
      site: suggestion.address,
    }));
  };

  const toggleCrewAssignment = (member: CrewMember, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      crewAssigned: checked
        ? Array.from(new Set([...prev.crewAssigned, member.id]))
        : prev.crewAssigned.filter((id) => id !== member.id),
    }));
  };

  const parseDateInput = (value: string): Date => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return defaultStart;
    }
    return parsed;
  };

  const resetForm = () => {
    const newStart = addHours(parseDateInput(draft.start), 1);
    setDraft({
      jobName: '',
      site: '',
      start: formatDateTimeLocal(newStart),
      durationHours: draft.durationHours,
      crewRequired: Math.min(capacityPerShift, draft.crewRequired),
      crewAssigned: [],
      accessibilityImpact: 'none',
      priority: 'standard',
      status: 'scheduled',
      notes: '',
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.jobName.trim()) {
      toast.error('Add a mission title before scheduling.');
      return;
    }
    const start = parseDateInput(draft.start);
    const end = addMinutes(start, Math.max(1, draft.durationHours) * 60);
    if (end <= start) {
      toast.error('Duration must be at least one hour.');
      return;
    }

    const task = addTask({
      jobName: draft.jobName.trim(),
      jobId: undefined,
      site: draft.site.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
      crewRequired: Math.max(1, draft.crewRequired),
      crewAssignedIds: draft.crewAssigned,
      status: draft.status,
      priority: draft.priority,
      accessibilityImpact: draft.accessibilityImpact,
      notes: draft.notes.trim(),
      color:
        draft.priority === 'critical'
          ? '#f97316'
          : draft.priority === 'standard'
            ? '#38bdf8'
            : '#22c55e',
    });
    if (draft.crewAssigned.length > 0) {
      assignCrew(task.id, draft.crewAssigned);
    }
    toast.success(`${task.jobName} scheduled for ${new Date(task.start).toLocaleString()}`);
    resetForm();
  };

  return (
    <Card className="bg-slate-950/60 border-white/10 shadow-xl">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold uppercase tracking-[0.3em] text-slate-100">
            Mission Timeline Intake
          </CardTitle>
          <span className="text-xs font-medium uppercase tracking-widest text-orange-200/90">
            Crew capacity {capacityPerShift}
          </span>
        </div>
        <p className="text-xs text-slate-300/80">
          Drop new missions onto the tactical schedule with ADA-safe windows and crew staffing baked
          in.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit} data-testid="mission-task-form">
          <div className="grid gap-2">
            <Label
              htmlFor="mission-title"
              className="text-xs uppercase tracking-[0.3em] text-slate-200"
            >
              Mission Title
            </Label>
            <Input
              id="mission-title"
              value={draft.jobName}
              onChange={(event) => setDraft((prev) => ({ ...prev, jobName: event.target.value }))}
              placeholder="e.g., East Lot Sealcoat"
              required
            />
            {jobSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-slate-300/70">
                <span className="uppercase tracking-[0.3em] text-[10px] text-slate-400">
                  Quick Fill:
                </span>
                {jobSuggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 hover:bg-white/10"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            ) : null}
            {isLoadingJobs ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Loading job history…
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="mission-site"
              className="text-xs uppercase tracking-[0.3em] text-slate-200"
            >
              Site / Campus Zone
            </Label>
            <Input
              id="mission-site"
              value={draft.site}
              onChange={(event) => setDraft((prev) => ({ ...prev, site: event.target.value }))}
              placeholder="e.g., North Entrance, Chapel Lot"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label
                htmlFor="mission-start"
                className="text-xs uppercase tracking-[0.3em] text-slate-200"
              >
                Start Window
              </Label>
              <Input
                id="mission-start"
                type="datetime-local"
                value={draft.start}
                onChange={(event) => setDraft((prev) => ({ ...prev, start: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="mission-duration"
                className="text-xs uppercase tracking-[0.3em] text-slate-200"
              >
                Duration (Hours)
              </Label>
              <Input
                id="mission-duration"
                type="number"
                min={1}
                max={48}
                step={0.5}
                value={draft.durationHours}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, durationHours: Number(event.target.value) }))
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">
                Crew Required
              </Label>
              <Input
                type="number"
                min={1}
                max={capacityPerShift * 2}
                value={draft.crewRequired}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, crewRequired: Number(event.target.value) }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">Priority</Label>
              <Select
                value={draft.priority}
                onValueChange={(value: MissionTaskPriority) =>
                  setDraft((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">
                Accessibility Impact
              </Label>
              <Select
                value={draft.accessibilityImpact}
                onValueChange={(value: MissionTaskDraft['accessibilityImpact']) =>
                  setDraft((prev) => ({ ...prev, accessibilityImpact: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="entrance">Entrance</SelectItem>
                  <SelectItem value="walkway">Walkway</SelectItem>
                  <SelectItem value="mobility">Mobility Routes</SelectItem>
                  <SelectItem value="auditorium">Auditorium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Crew Assignments</p>
            {crewOptions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                Add crew members below to unlock targeted assignments.
              </p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {crewOptions.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
                  >
                    <Checkbox
                      checked={draft.crewAssigned.includes(member.id)}
                      onCheckedChange={(checked) => toggleCrewAssignment(member, Boolean(checked))}
                      aria-label={`Assign ${member.name}`}
                    />
                    <span className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-100">
                        {member.name}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300/80">
                        {member.role}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-xs uppercase tracking-[0.3em] text-slate-200">
              Mission Notes
            </Label>
            <Textarea
              value={draft.notes}
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="ADA detours, Sunday service reminders, staging requirements, etc."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Crew assigned: {draft.crewAssigned.length}/{capacityPerShift}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="tactical"
                className="px-6"
                data-testid="mission-submit"
              >
                Queue Mission
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
