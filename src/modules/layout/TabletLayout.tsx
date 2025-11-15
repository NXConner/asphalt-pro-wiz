import { memo, type ReactNode } from 'react';

import type { CommandLayoutMode } from './layoutModes';
import type { CanvasWallpaper } from './wallpapers';

import { PriorityCard } from '@/components/ui/priority-card';

interface TabletLayoutProps {
  wallpaper: CanvasWallpaper;
  layoutMode: CommandLayoutMode;
  header: ReactNode;
  missionControl: ReactNode;
  estimator: ReactNode;
  insights: ReactNode;
  engagement: ReactNode;
}

export const TabletLayout = memo(function TabletLayout({
  wallpaper,
  layoutMode,
  header,
  missionControl,
  estimator,
  insights,
  engagement,
}: TabletLayoutProps) {
  const renderLayout = () => {
    if (layoutMode === 'timeline') {
      return (
        <>
          <PriorityCard title="Mission Control" priority="high">
            {missionControl}
          </PriorityCard>
          <PriorityCard title="Insight Tower" priority="medium">
            {insights}
          </PriorityCard>
          <PriorityCard title="Estimator Studio" priority="critical">
            {estimator}
          </PriorityCard>
          <PriorityCard title="Engagement Hub" priority="low" collapsible defaultExpanded={false}>
            {engagement}
          </PriorityCard>
        </>
      );
    }

    if (layoutMode === 'immersive') {
      return (
        <>
          <div className="rounded-[24px] border border-white/10 bg-black/40 p-1">
            {missionControl}
          </div>
          <PriorityCard title="Estimator Studio" priority="critical">
            {estimator}
          </PriorityCard>
          <PriorityCard title="Insight Tower" priority="medium">
            {insights}
          </PriorityCard>
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-1">
            {engagement}
          </div>
        </>
      );
    }

    return (
      <>
        <PriorityCard title="Mission Control" priority="high">
          {missionControl}
        </PriorityCard>
        <PriorityCard title="Estimator Studio" priority="critical">
          {estimator}
        </PriorityCard>
        <PriorityCard title="Insight Tower" priority="medium">
          {insights}
        </PriorityCard>
        <PriorityCard title="Engagement Hub" priority="low" collapsible defaultExpanded={false}>
          {engagement}
        </PriorityCard>
      </>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-auto text-foreground"
      style={{ background: wallpaper.gradient }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.78)_0%,_rgba(2,6,23,0.94)_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-8 pt-6">
        <h1 className="sr-only">Pavement Performance Suite - Tablet View</h1>

        {/* Header */}
        <div className="mb-4">{header}</div>

        <div className="space-y-4">{renderLayout()}</div>
      </div>
    </div>
  );
});
