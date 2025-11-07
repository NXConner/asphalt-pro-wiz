import { motion } from 'framer-motion';
import { Sparkles, TimerReset } from 'lucide-react';
import { memo } from 'react';

import { mergeHudTypography } from '@/design';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export interface TacticalHudOverlayProps {
  missionName: string;
  missionStatus: string;
  missionPhase?: string;
  totalAreaSqFt: number;
  totalCost?: number | null;
  travelMiles?: number;
  coordinates?: [number, number] | null;
  scheduleWindow?: { start: string; end: string } | null;
  lastUpdatedIso?: string | null;
  environment?: {
    tempF?: number;
    conditions?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  flags?: Array<{ id: string; label: string; active: boolean }>;
  watchers?: Array<{ label: string; value: string; tone?: 'ok' | 'warn' | 'critical' }>;
  className?: string;
}

const watcherTone: Record<NonNullable<TacticalHudOverlayProps['watchers']>[number]['tone'], string> = {
  ok: 'text-success',
  warn: 'text-warning',
  critical: 'text-destructive',
};

const riskTone: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

const motionPreset = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
} as const;

export const TacticalHudOverlay = memo(function TacticalHudOverlay(
  {
    missionName,
    missionStatus,
    missionPhase,
    totalAreaSqFt,
    totalCost,
    travelMiles,
    coordinates,
    scheduleWindow,
    lastUpdatedIso,
    environment,
    flags,
    watchers,
    className,
  }: TacticalHudOverlayProps,
) {
  const { preferences } = useTheme();
  const formattedCost = typeof totalCost === 'number' ? currencyFormatter.format(totalCost) : '—';
  const formattedArea = totalAreaSqFt > 0 ? `${numberFormatter.format(totalAreaSqFt)} sq ft` : 'Awaiting draw';
  const formattedTravel = typeof travelMiles === 'number' && travelMiles > 0
    ? `${numberFormatter.format(travelMiles)} mi RT`
    : 'Pending capture';

  const formattedCoords = coordinates
    ? `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`
    : 'No lock';

  const formattedWindow = scheduleWindow
    ? `${shortDateFormatter.format(new Date(scheduleWindow.start))} → ${shortDateFormatter.format(
        new Date(scheduleWindow.end),
      )}`
    : 'Not scheduled';

  const updatedLabel = lastUpdatedIso ? shortDateFormatter.format(new Date(lastUpdatedIso)) : 'live';

  const missionGlyph = missionStatus.toUpperCase();

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-[5] flex flex-col justify-between px-3 pt-3 pb-8 sm:px-6 sm:pt-4 sm:pb-10 lg:px-10',
        'text-foreground/80',
        className,
      )}
    >
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <motion.section
          {...motionPreset}
          className="pointer-events-auto relative isolate flex flex-col gap-4 sm:gap-5 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/80 px-4 py-3 sm:px-5 sm:py-4 shadow-lg backdrop-blur-md"
          style={{
            backdropFilter: `blur(${preferences.hudBlur}px)`,
            backgroundColor: `hsl(var(--card) / ${preferences.hudOpacity})`,
          }}
        >
          <div className="hud-grid-divider absolute inset-y-3 left-0 w-[1px] opacity-30" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <p className="hud-eyebrow text-muted-foreground">Current Mission</p>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-wider text-foreground"
                style={{
                  textShadow: '0 0 16px hsl(var(--accent) / 0.25)',
                }}
              >
                {missionName || 'Unnamed Operation'}
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="hud-eyebrow text-xs text-muted-foreground">STATUS</span>
              <span
                className={cn(
                  'rounded-full border border-primary/40 px-3 sm:px-4 py-1 text-[0.72rem] font-semibold tracking-[0.45em]',
                  'bg-primary/10 text-primary-foreground',
                )}
              >
                {missionGlyph}
              </span>
              {missionPhase ? (
                <span className="hud-mono mt-1 text-xs text-muted-foreground">{missionPhase}</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <OverlayMetric label="Mission Budget" value={formattedCost} accent="accent" />
            <OverlayMetric label="Surface Footprint" value={formattedArea} accent="secondary" />
            <OverlayMetric label="Travel Logistics" value={formattedTravel} accent="primary" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <OverlayCallout
              label="Site Coordinates"
              value={formattedCoords}
              icon={<Sparkles className="h-4 w-4" />}
            />
            <OverlayCallout
              label="Schedule Window"
              value={formattedWindow}
              icon={<TimerReset className="h-4 w-4" />}
            />
          </div>
        </motion.section>

        <motion.section
          {...motionPreset}
          transition={{ ...motionPreset.transition, delay: 0.18 }}
          className="pointer-events-auto relative flex flex-col gap-4 rounded-2xl sm:rounded-3xl border border-border/50 bg-card/80 px-4 py-3 sm:px-5 sm:py-4 shadow-lg backdrop-blur-md"
          style={{
            backdropFilter: `blur(${preferences.hudBlur}px)`,
            backgroundColor: `hsl(var(--card) / ${preferences.hudOpacity})`,
          }}
        >
          <header className="flex items-center justify-between">
            <p className="hud-eyebrow text-muted-foreground">Mission Telemetry</p>
            <span className="hud-mono text-xs text-muted-foreground/70">Updated {updatedLabel}</span>
          </header>

          {environment ? (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20 px-3 sm:px-4 py-2 sm:py-3 text-xs">
              <span className="hud-eyebrow text-[0.58rem] text-muted-foreground">SITE CONDITIONS</span>
              {typeof environment.tempF === 'number' ? (
                <span className="hud-mono text-foreground/85">{environment.tempF.toFixed(0)}°F</span>
              ) : null}
              {environment.conditions ? (
                <span className="hud-mono text-foreground/70">{environment.conditions}</span>
              ) : null}
              {environment.riskLevel ? (
                <span className={cn('hud-mono uppercase tracking-[0.35em]', riskTone[environment.riskLevel])}>
                  {environment.riskLevel} risk
                </span>
              ) : null}
            </div>
          ) : null}

          {flags && flags.length ? (
            <ul className="flex flex-wrap gap-2">
              {flags.map((flag) => (
                <li
                  key={flag.id}
                  className={cn(
                    'hud-mono inline-flex items-center gap-2 rounded-full border px-2.5 sm:px-3 py-1 text-[0.68rem]',
                    flag.active
                      ? 'border-success/50 bg-success/15 text-success-foreground'
                      : 'border-border/30 bg-muted/20 text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      flag.active ? 'bg-success shadow-[0_0_12px_hsl(var(--success)/0.6)]' : 'bg-muted-foreground',
                    )}
                  />
                  {flag.label}
                </li>
              ))}
            </ul>
          ) : null}

          {watchers && watchers.length ? (
            <div className="grid gap-2">
              {watchers.map((watcher) => (
                <div
                  key={watcher.label}
                  className="flex items-center justify-between rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span className="hud-mono text-xs text-muted-foreground">{watcher.label}</span>
                  <span className={cn('hud-mono text-sm uppercase tracking-[0.35em]', watcher.tone ? watcherTone[watcher.tone] : 'text-foreground')}>
                    {watcher.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="hud-mono text-xs text-muted-foreground">Telemetry queue clear.</p>
          )}
        </motion.section>
      </div>

      <motion.footer
        {...motionPreset}
        transition={{ ...motionPreset.transition, delay: 0.28 }}
        className="hidden sm:grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <OverlayFooterTile label="Command Mode" value={missionPhase ?? 'Awaiting briefing'} />
        <OverlayFooterTile
          label="Live Flags"
          value={flags?.filter((f) => f.active).length ?? 0}
          secondary={`${flags?.length ?? 0} total`}
        />
        <OverlayFooterTile label="Area Captured" value={formattedArea} />
        <OverlayFooterTile label="RT Distance" value={formattedTravel} />
      </motion.footer>
    </div>
  );
});

interface OverlayMetricProps {
  label: string;
  value: string;
  accent?: 'primary' | 'secondary' | 'accent';
}

function OverlayMetric({ label, value, accent = 'primary' }: OverlayMetricProps) {
  const accentClass =
    accent === 'primary'
      ? 'text-primary-foreground'
      : accent === 'secondary'
        ? 'text-secondary-foreground'
        : 'text-accent-foreground';

  return (
    <article className="rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20 px-3 py-2.5 sm:py-3">
      <span className="hud-eyebrow text-[0.58rem] text-muted-foreground">{label}</span>
      <p className={cn('hud-mono mt-1 text-sm', accentClass)}>{value}</p>
    </article>
  );
}

interface OverlayCalloutProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function OverlayCallout({ label, value, icon }: OverlayCalloutProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-border/40 bg-muted/20 px-3 sm:px-4 py-2.5 sm:py-3">
      <div>
        <span className="hud-eyebrow text-[0.58rem] text-muted-foreground">{label}</span>
        <p className="hud-mono text-sm text-foreground/85">{value}</p>
      </div>
      {icon ? <span className="text-accent/80">{icon}</span> : null}
    </article>
  );
}

interface OverlayFooterTileProps {
  label: string;
  value: string | number;
  secondary?: string;
}

function OverlayFooterTile({ label, value, secondary }: OverlayFooterTileProps) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/70 px-3 sm:px-4 py-2.5 sm:py-3">
      <span className="hud-eyebrow text-[0.58rem] text-muted-foreground">{label}</span>
      <p className="hud-mono text-[0.95rem] text-foreground/85">{value}</p>
      {secondary ? <p className="hud-mono text-xs text-muted-foreground">{secondary}</p> : null}
    </div>
  );
}

export type { OverlayMetricProps as TacticalHudOverlayMetricProps };
