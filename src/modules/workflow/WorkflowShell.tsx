import { RefreshCcw, UploadCloud } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { WORKFLOW_THEMES, type WorkflowThemeId } from '@/design/system';

import { WorkflowContext } from './context/WorkflowContext';
import { WorkflowSummaryPanel } from './components/WorkflowSummaryPanel';
import { WorkflowTimeline } from './components/WorkflowTimeline';
import { useWorkflowStageEvents } from './hooks/useWorkflowStageEvents';
import type { UseWorkflowStageEventsResult } from './hooks/useWorkflowStageEvents';
import { useWorkflowOutreach } from './hooks/useWorkflowOutreach';
import type { UseWorkflowOutreachResult } from './hooks/useWorkflowOutreach';
import { STAGE_LABELS } from './constants';
import type { WorkflowShellProps, WorkflowStageId } from './types';

export function WorkflowShell({
  stages,
  activeStageId,
  onStageChange,
  wallpaper,
  onNextWallpaper,
  onUploadWallpaper,
  uploadingWallpaper,
  toolbarSlot,
  hudOverlay,
  missionMeta,
  workflowThemeId = 'sunrise',
  jobId,
}: WorkflowShellProps) {
  const activeStage = stages.find((stage) => stage.id === activeStageId);
  const activeTheme = useMemo(() => {
    return WORKFLOW_THEMES.find((theme) => theme.id === workflowThemeId) ?? WORKFLOW_THEMES[0];
  }, [workflowThemeId]);
  const stageEvents = useWorkflowStageEvents(jobId);
  const outreachLog = useWorkflowOutreach(jobId);

  const handleWallpaperUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUploadWallpaper || !event.target.files?.length) return;
    onUploadWallpaper(event.target.files[0]);
  };

  return (
    <WorkflowContext.Provider value={{ stages, activeStageId, setActiveStage: onStageChange }}>
      <div
        className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
        style={Object.fromEntries(Object.entries(activeTheme.tokens))}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: wallpaper?.source ? `url(${wallpaper.source})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
          }}
        />
        <div className="relative z-10 space-y-6 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-2xl">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-white/50">Pavement Workflow</p>
              <h1 className="text-3xl font-semibold text-white">Step-by-step mission planner</h1>
              <p className="text-sm text-white/65">
                Begin with measurement capture then flow through estimate, outreach, contract, and deployment.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {toolbarSlot}
              <Button type="button" variant="ghost" onClick={onNextWallpaper} disabled={!onNextWallpaper}>
                Cycle wallpaper
              </Button>
              <label
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/15 px-3 py-2 text-sm text-white/70 transition hover:border-white/25',
                  uploadingWallpaper && 'opacity-50',
                )}
              >
                <UploadCloud className="h-4 w-4" />
                Custom background
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingWallpaper}
                  onChange={handleWallpaperUpload}
                />
              </label>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <div className="space-y-6">
              <WorkflowTimeline stages={stages} activeStageId={activeStageId} onStageChange={onStageChange} />
              <WorkflowSummaryPanel mission={missionMeta} />
              {(stageEvents.isRemoteSourceActive || stageEvents.events.length > 0) && (
                <StageEventsCard data={stageEvents} />
              )}
              {(outreachLog.isRemoteSourceActive || outreachLog.touchpoints.length > 0) && (
                <OutreachCard data={outreachLog} />
              )}
              {hudOverlay ? (
                <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">{hudOverlay}</div>
              ) : null}
            </div>
            <div className="space-y-6">
              {activeStage ? (
                <ScrollArea className="max-h-[calc(100vh-140px)] rounded-3xl">
                  <div className="space-y-6">
                    {renderStagePanel(activeStageId, activeStage.panel)}
                    {activeStage.inspector ? (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        {activeStage.inspector}
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/70">
                  Select a stage from the rail to begin.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkflowContext.Provider>
  );
}

function renderStagePanel(stageId: WorkflowStageId, panel: ReactNode) {
  return <div data-stage-panel={stageId}>{panel}</div>;
}

interface StageEventsCardProps {
  data: UseWorkflowStageEventsResult;
}

function StageEventsCard({ data }: StageEventsCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/55">
            Workflow Activity
          </p>
          <p className="text-sm text-white/70">Recent stage transitions synced from Supabase.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={data.refresh} disabled={data.isLoading}>
          <RefreshCcw className={cn('h-4 w-4', data.isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
      {data.error ? <p className="mt-2 text-xs text-rose-300">{data.error}</p> : null}
      {data.events.length ? (
        <ul className="mt-4 space-y-3">
          {data.events.map((event) => (
            <li key={event.id ?? `${event.stageId}-${event.createdAt ?? Math.random()}`} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{STAGE_LABELS[event.stageId]}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">{event.status}</p>
                </div>
                {event.createdAt ? (
                  <span className="text-xs text-white/50">{new Date(event.createdAt).toLocaleString()}</span>
                ) : null}
              </div>
              {event.notes ? <p className="mt-2 text-xs text-white/65">{event.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/60">
          {data.isRemoteSourceActive ? 'No workflow events logged yet.' : 'Connect Supabase to see workflow telemetry.'}
        </p>
      )}
    </div>
  );
}

interface OutreachCardProps {
  data: UseWorkflowOutreachResult;
}

function OutreachCard({ data }: OutreachCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/55">
            Outreach Log
          </p>
          <p className="text-sm text-white/70">Pastor/board communications with status tracking.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={data.refresh} disabled={data.isLoading}>
          <RefreshCcw className={cn('h-4 w-4', data.isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
      {data.error ? <p className="mt-2 text-xs text-rose-300">{data.error}</p> : null}
      {data.touchpoints.length ? (
        <ul className="mt-4 space-y-3">
          {data.touchpoints.map((touchpoint) => {
            const contact = (touchpoint.contact ?? {}) as Record<string, string>;
            const contactLabel = contact.name ?? contact.email ?? contact.phone ?? 'Primary contact';
            return (
              <li key={touchpoint.id ?? `${touchpoint.channel}-${touchpoint.subject ?? Math.random()}`} className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{touchpoint.subject ?? contactLabel}</p>
                    <p className="text-xs text-white/60">
                      {touchpoint.channel.toUpperCase()} · {touchpoint.status}
                    </p>
                  </div>
                  {touchpoint.sentAt ? (
                    <span className="text-xs text-white/50">{new Date(touchpoint.sentAt).toLocaleString()}</span>
                  ) : touchpoint.scheduledAt ? (
                    <span className="text-xs text-white/50">
                      Schedules {new Date(touchpoint.scheduledAt).toLocaleString()}
                    </span>
                  ) : null}
                </div>
                {touchpoint.body ? (
                  <p className="mt-2 line-clamp-3 text-xs text-white/65">{touchpoint.body}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/60">
          {data.isRemoteSourceActive ? 'No outreach touchpoints logged yet.' : 'Connect Supabase to sync outreach history.'}
        </p>
      )}
    </div>
  );
}
