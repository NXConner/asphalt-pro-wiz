import { CloudSun, MapPin, ShieldCheck, ThermometerSun } from 'lucide-react';
import { useMemo } from 'react';

import { CommandStat, StatusPill, TacticalPanel } from '@/components/foundation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DIVISION_WALLPAPERS } from '@/design';
import { cn } from '@/lib/utils';

const STAT_BLOCK = [
  {
    label: 'Crew Readiness',
    value: '92%',
    tone: 'positive' as const,
    trendValue: '+6%',
    trendLabel: 'vs last Sunday deployment',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    label: 'Campus Coverage',
    value: '17',
    tone: 'info' as const,
    trendValue: '+3',
    trendLabel: 'active lots prepared this week',
    icon: <MapPin className="h-4 w-4" />,
  },
  {
    label: 'Weather Index',
    value: '64%',
    tone: 'warning' as const,
    trendValue: '-12%',
    trendDirection: 'down' as const,
    trendLabel: 'threat window next 48h',
    icon: <ThermometerSun className="h-4 w-4" />,
  },
];

export function ThemeFoundationShowcase() {
  const wallpapers = useMemo(() => DIVISION_WALLPAPERS.slice(0, 8), []);

  return (
    <section aria-labelledby="theme-foundation-showcase" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2
            id="theme-foundation-showcase"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.36em] text-slate-200"
          >
            <CloudSun className="h-4 w-4" aria-hidden="true" /> Mission UI Foundation
          </h2>
          <p className="text-xs text-slate-300/70">
            Core HUD-ready components react instantly to palette changes and wallpapers. Use this
            playground to verify density, contrast, and motion pairings.
          </p>
        </div>
        <StatusPill tone="info" emphasis="solid">
          design tokens synced
        </StatusPill>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TacticalPanel
          tone="aurora"
          title="Live Metric Stack"
          description="CommandStat adapts to active theme hues, accessible focus states, and deltas."
          className="lg:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-3">
            {STAT_BLOCK.map((stat) => (
              <CommandStat key={stat.label} {...stat} />
            ))}
          </div>
        </TacticalPanel>

        <TacticalPanel
          tone="rogue"
          title="Status Palette"
          description="Reusable status pills inherit theme tokens for alerts, wins, and info banners."
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="positive" emphasis="solid">
              On track
            </StatusPill>
            <StatusPill tone="warning" emphasis="solid">
              Weather hold
            </StatusPill>
            <StatusPill tone="critical" emphasis="solid">
              Compliance review
            </StatusPill>
            <StatusPill tone="info" emphasis="outline">
              Supplier intel
            </StatusPill>
            <StatusPill tone="neutral" emphasis="outline">
              Draft
            </StatusPill>
          </div>
        </TacticalPanel>
      </div>

      <TacticalPanel
        tone="stealth"
        title="Wallpaper Atmospheres"
        description="Real-time wallpaper grid showcases Division presets plus custom uploads."
      >
        <ScrollArea className="h-64">
          <div className="grid gap-3 md:grid-cols-4">
            {wallpapers.map((wallpaper) => (
              <article
                key={wallpaper.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-white/10 p-4 text-left transition hover:-translate-y-0.5',
                  wallpaper.id === 'division-twilight-ops'
                    ? 'shadow-[0_25px_60px_rgba(255,145,0,0.25)]'
                    : 'shadow-[0_12px_30px_rgba(2,4,20,0.45)]',
                )}
                style={{ background: wallpaper.gradient }}
              >
                <div className="relative z-10 space-y-1 text-white drop-shadow-lg">
                  <p className="text-[0.6rem] uppercase tracking-[0.32em] opacity-80">
                    {wallpaper.name}
                  </p>
                  <p className="text-xs opacity-90">{wallpaper.description}</p>
                </div>
                <span
                  className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-slate-950/50 to-slate-950/80"
                  aria-hidden="true"
                />
              </article>
            ))}
          </div>
        </ScrollArea>
      </TacticalPanel>
    </section>
  );
}
