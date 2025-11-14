import { memo, type ReactNode } from 'react';

import type { CanvasWallpaper } from './wallpapers';

import { PriorityCard } from '@/components/ui/priority-card';

interface TabletLayoutProps {
  wallpaper: CanvasWallpaper;
  header: ReactNode;
  missionControl: ReactNode;
  estimator: ReactNode;
  insights: ReactNode;
  engagement: ReactNode;
}

export const TabletLayout = memo(function TabletLayout({
  wallpaper,
  header,
  missionControl,
  estimator,
  insights,
  engagement,
}: TabletLayoutProps) {
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

        {/* Stacked Panels with Priority */}
        <div className="space-y-4">
          {/* Mission Control - High Priority */}
          <PriorityCard title="Mission Control" priority="high" collapsible defaultExpanded>
            {missionControl}
          </PriorityCard>

          {/* Estimator - Critical Priority */}
          <PriorityCard title="Estimator Studio" priority="critical">
            {estimator}
          </PriorityCard>

          {/* Insights - Medium Priority */}
          <PriorityCard title="Insight Tower" priority="medium" collapsible defaultExpanded>
            {insights}
          </PriorityCard>

          {/* Engagement - Low Priority */}
          <PriorityCard title="Engagement Hub" priority="low" collapsible defaultExpanded={false}>
            {engagement}
          </PriorityCard>
        </div>
      </div>
    </div>
  );
});
