import { memo, type ReactNode } from 'react';

import type { CommandLayoutMode } from './layoutModes';
import type { CanvasWallpaper } from './wallpapers';

import { CanvasGrid, ParticleBackground } from '@/components/hud';

interface DesktopLayoutProps {
  wallpaper: CanvasWallpaper;
  layoutMode: CommandLayoutMode;
  header: ReactNode;
  missionControl: ReactNode;
  estimator: ReactNode;
  insights: ReactNode;
  engagement: ReactNode;
  hudOverlay?: ReactNode;
}

export const DesktopLayout = memo(function DesktopLayout({
  wallpaper,
  layoutMode,
  header,
  missionControl,
  estimator,
  insights,
  engagement,
  hudOverlay,
}: DesktopLayoutProps) {
  const renderLayout = () => {
    if (layoutMode === 'timeline') {
      return (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-12 space-y-5">{missionControl}</div>
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">{estimator}</div>
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">{insights}</div>
          <div className="lg:col-span-12">{engagement}</div>
        </div>
      );
    }

    if (layoutMode === 'immersive') {
      return (
        <div className="flex flex-col gap-6">
          <div className="rounded-[32px] border border-white/10 bg-black/40 p-1">
            {missionControl}
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-5">{estimator}</div>
            <div className="lg:col-span-4 space-y-5">{insights}</div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-1">
            {engagement}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {missionControl}
          {estimator}
        </div>
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {insights}
          {engagement}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-slate-50"
      style={{ background: wallpaper.gradient }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.78)_0%,_rgba(2,6,23,0.94)_60%)]" />
      <div
        className="absolute inset-0 bg-repeat opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='720' height='720' viewBox='0 0 720 720' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd' opacity='0.12'%3E%3Cpath d='M0 720h720V0H0z'/%3E%3Cpath d='M360 0v720M0 360h720' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <ParticleBackground
        preset={wallpaper.particlePreset}
        densityMultiplier={0.5}
        className="opacity-35 mix-blend-screen"
      />
      <CanvasGrid density={80} className="opacity-[var(--hud-grid-opacity)]" />
      {hudOverlay}

      <div className="relative z-10 mx-auto flex w-full max-w-[1536px] flex-col gap-6 px-4 pb-10 pt-8 sm:px-6 lg:px-10">
        <h1 className="sr-only">Pavement Performance Suite - Desktop Command Center</h1>
        {header}
        <main className="space-y-6">{renderLayout()}</main>
      </div>
    </div>
  );
});
