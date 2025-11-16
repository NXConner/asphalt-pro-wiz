import { UploadCloud } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { WORKFLOW_THEMES, type WorkflowThemeId } from '@/design/system';

import { WorkflowContext } from './context/WorkflowContext';
import { WorkflowSummaryPanel } from './components/WorkflowSummaryPanel';
import { WorkflowTimeline } from './components/WorkflowTimeline';
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
}: WorkflowShellProps) {
  const activeStage = stages.find((stage) => stage.id === activeStageId);
  const activeTheme = useMemo(() => {
    return WORKFLOW_THEMES.find((theme) => theme.id === workflowThemeId) ?? WORKFLOW_THEMES[0];
  }, [workflowThemeId]);

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
