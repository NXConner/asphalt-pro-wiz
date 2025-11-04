import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { CanvasWallpaper } from "./wallpapers";

interface OperationsCanvasProps {
  wallpaper: CanvasWallpaper;
  header: ReactNode;
  missionControl: ReactNode;
  estimatorStudio: ReactNode;
  insightTower: ReactNode;
  engagementHub: ReactNode;
  footer?: ReactNode;
}

export function OperationsCanvas({
  wallpaper,
  header,
  missionControl,
  estimatorStudio,
  insightTower,
  engagementHub,
  footer,
}: OperationsCanvasProps) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-slate-50"
      style={{ background: wallpaper.gradient }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.78)_0%,_rgba(2,6,23,0.94)_60%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"720\" height=\"720\" viewBox=\"0 0 720 720\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\" opacity=\"0.12\"%3E%3Cpath d=\"M0 720h720V0H0z\"/%3E%3Cpath d=\"M360 0v720M0 360h720\" stroke=\"%23ffffff\" stroke-opacity=\"0.08\" stroke-width=\"2\"/%3E%3C/g%3E%3C/svg%3E')] bg-repeat opacity-30" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 pb-12 pt-12 sm:px-8 lg:px-12">
        {header}
        <main className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          <div className="flex flex-col gap-6 xl:col-span-7">
            {missionControl}
            {estimatorStudio}
          </div>
          <div className="flex flex-col gap-6 xl:col-span-5">
            {insightTower}
            {engagementHub}
          </div>
        </main>
        {footer ? <div className={cn("mt-4", "text-xs text-slate-200/70")}>{footer}</div> : null}
      </div>
    </div>
  );
}
