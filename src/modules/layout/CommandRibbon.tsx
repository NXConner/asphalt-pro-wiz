import { Camera, Gauge, Keyboard, LayoutGrid, Shield, Sparkles, Timeline, UploadCloud } from 'lucide-react';
import { memo, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

import type { CommandLayoutMode } from './layoutModes';
import type { CanvasWallpaper } from './wallpapers';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const layoutIcons: Record<CommandLayoutMode, typeof LayoutGrid> = {
  grid: LayoutGrid,
  timeline: Timeline,
  immersive: Sparkles,
};

const watcherToneStyles: Record<string, string> = {
  ok: 'from-emerald-400/30 via-emerald-400/10 to-transparent text-emerald-100 border-emerald-300/40',
  warn: 'from-amber-400/30 via-amber-400/10 to-transparent text-amber-100 border-amber-300/40',
  critical: 'from-rose-500/30 via-rose-500/10 to-transparent text-rose-100 border-rose-400/40',
};

export interface CommandRibbonProps {
  wallpaper: CanvasWallpaper;
  missionPhase: string;
  summary: {
    jobName: string;
    totalArea: number;
    totalCost: number | null;
  };
  watchers: Array<{ label: string; value: string; tone?: 'ok' | 'warn' | 'critical' }>;
  hudFlags: Array<{ id: string; label: string; active: boolean }>;
  layoutMode: CommandLayoutMode;
  onLayoutModeChange: (mode: CommandLayoutMode) => void;
  onNextWallpaper: () => void;
  onUploadWallpaper: (file: File) => Promise<void> | void;
  uploadingWallpaper?: boolean;
  themeTrigger: ReactNode;
  onOpenShortcuts: () => void;
  onOpenCompliance: () => void;
}

export const CommandRibbon = memo(function CommandRibbon({
  wallpaper,
  missionPhase,
  summary,
  watchers,
  hudFlags,
  layoutMode,
  onLayoutModeChange,
  onNextWallpaper,
  onUploadWallpaper,
  uploadingWallpaper = false,
  themeTrigger,
  onOpenShortcuts,
  onOpenCompliance,
}: CommandRibbonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localUploading, setLocalUploading] = useState(false);
  const uploading = uploadingWallpaper || localUploading;

  const watcherGroups = watchers.slice(0, 6);
  const activeFlags = hudFlags.filter((flag) => flag.active);
  const dormantFlags = hudFlags.filter((flag) => !flag.active);

  const areaDisplay = useMemo(() => {
    if (summary.totalArea <= 0) return 'Awaiting takeoff';
    if (summary.totalArea > 100000) {
      return `${(summary.totalArea / 1000).toFixed(1)}k sq ft`;
    }
    return `${summary.totalArea.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`;
  }, [summary.totalArea]);

  const costDisplay = useMemo(() => {
    if (summary.totalCost === null) return 'Run estimator';
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: summary.totalCost >= 100000 ? 0 : 2,
    }).format(summary.totalCost);
  }, [summary.totalCost]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setLocalUploading(true);
      await onUploadWallpaper(file);
    } finally {
      setLocalUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 p-4 shadow-[0_18px_60px_rgba(3,7,18,0.65)] backdrop-blur-2xl sm:p-6 lg:p-7">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-slate-900/40 to-slate-950 pointer-events-none" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate-300/70">Mission Phase</p>
            <div className="mt-1 flex items-center gap-3">
              <Badge className="bg-orange-500/20 text-orange-200 hover:bg-orange-400/30">
                {missionPhase}
              </Badge>
              <Badge variant="secondary" className="bg-slate-800/80 text-slate-100">
                {summary.jobName || 'Untitled scope'}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {themeTrigger}
            <Button
              type="button"
              variant="outline"
              className="border-slate-700/70 text-slate-100 hover:bg-slate-800/60"
              onClick={onOpenShortcuts}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Shortcuts
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-slate-200 hover:bg-amber-500/10"
              onClick={onOpenCompliance}
            >
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Surface Area</p>
            <p className="mt-1 text-3xl font-semibold text-slate-50">{areaDisplay}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.5em] text-slate-500">Projected Bid</p>
            <p className="mt-1 text-2xl font-semibold text-slate-100">{costDisplay}</p>
          </div>
          <div
            className="col-span-2 rounded-2xl border border-white/10 p-4 text-slate-50 transition-colors"
            style={{ background: wallpaper.gradient }}
          >
            <p className="text-xs uppercase tracking-[0.5em] text-white/70">Wallpaper</p>
            <p className="mt-1 text-2xl font-semibold">{wallpaper.name}</p>
            <p className="mt-1 text-sm text-white/80">{wallpaper.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="command"
                className="bg-black/40 text-white hover:bg-black/60"
                onClick={onNextWallpaper}
              >
                <Camera className="mr-2 h-4 w-4" /> Cycle Wallpaper
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploading ? 'Processing…' : 'Upload'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Layout Mode</p>
            <div className="mt-3 flex flex-col gap-2">
              {(['grid', 'timeline', 'immersive'] as CommandLayoutMode[]).map((mode) => {
                const Icon = layoutIcons[mode];
                const active = layoutMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onLayoutModeChange(mode)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-all',
                      active
                        ? 'border-teal-400/60 bg-teal-400/10 text-teal-200'
                        : 'border-white/10 text-slate-300 hover:border-white/30',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="capitalize">{mode}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {watcherGroups.map((watcher) => (
            <div
              key={watcher.label}
              className={cn(
                'rounded-2xl border px-3 py-2 text-sm font-medium uppercase tracking-[0.24em]',
                'bg-gradient-to-br',
                watcherToneStyles[watcher.tone ?? 'ok'] ?? watcherToneStyles.ok,
              )}
            >
              <p className="text-[0.62rem] text-white/70">{watcher.label}</p>
              <p className="mt-1 text-lg tracking-normal">{watcher.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.5em] text-slate-500">
            <Gauge className="h-3 w-3" /> Feature Flags
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFlags.slice(0, 8).map((flag) => (
              <Badge
                key={flag.id}
                className="border border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
              >
                {flag.label}
              </Badge>
            ))}
            {dormantFlags.slice(0, 4).map((flag) => (
              <Badge
                key={flag.id}
                variant="outline"
                className="border-slate-700/60 text-slate-400"
              >
                {flag.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
