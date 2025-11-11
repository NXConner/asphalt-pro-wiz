import { memo, type ReactNode } from 'react';

import type { CanvasWallpaper } from './wallpapers';

import { CanvasGrid, ParticleBackground } from '@/components/hud';
import { cn } from '@/lib/utils';

interface OperationsCanvasProps {
  wallpaper: CanvasWallpaper;
  header: ReactNode;
  missionControl: ReactNode;
  estimatorStudio: ReactNode;
  insightTower: ReactNode;
  engagementHub: ReactNode;
  footer?: ReactNode;
  hudOverlay?: ReactNode;
}

const OperationsCanvasComponent = ({
  wallpaper,
  header,
  missionControl,
  estimatorStudio,
  insightTower,
  engagementHub,
  footer,
  hudOverlay,
}: OperationsCanvasProps) => {
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
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 pb-8 pt-8 sm:px-6 sm:gap-5 sm:pb-10 sm:pt-10 lg:px-8 lg:gap-6 lg:pb-12 lg:pt-12">
        {/* Hidden h1 for SEO and accessibility */}
        <h1 className="sr-only">Pavement Performance Suite - Asphalt Maintenance Estimating</h1>
        {header}
        <main className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 xl:gap-6">
          {/* Mission Control - First and full width, optimized for performance */}
          <div className="lg:col-span-12">
            {missionControl}
          </div>
          {/* Left column - Estimator Studio */}
          <div className="flex flex-col gap-4 lg:col-span-7 xl:col-span-7">
            {estimatorStudio}
          </div>
          {/* Right column - Insight Tower and Engagement Hub */}
          <div className="flex flex-col gap-4 lg:col-span-5 xl:col-span-5">
            {insightTower}
            {engagementHub}
          </div>
        </main>
        {footer ? <div className={cn('mt-4', 'text-xs text-slate-200/70')}>{footer}</div> : null}
      </div>
    </div>
  );
};

export const OperationsCanvas = memo(OperationsCanvasComponent);
