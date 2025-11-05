import { motion } from 'framer-motion';
import { Sparkles, TimerReset } from 'lucide-react';
import { memo } from 'react';

import { mergeHudTypography } from '@/design';
import { cn } from '@/lib/utils';

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
  ok: 'text-emerald-300',
  warn: 'text-amber-300',
  critical: 'text-rose-300',
};

const riskTone: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-rose-300',
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
        'pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-4 pt-4 pb-10 sm:px-6 lg:px-10',
        'text-slate-100/80 backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <motion.section
          {...motionPreset}
          className="relative isolate flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-950/35 px-5 py-4 shadow-[0_24px_120px_rgba(4,8,20,0.38)] backdrop-blur"
        >
          <div className="hud-grid-divider absolute inset-y-3 left-0 w-[1px] opacity-30" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="hud-eyebrow">Current Mission</p>
              <h2
                style={mergeHudTypography('display-lg', {
                  textShadow: '0 0 16px rgba(56,189,248,0.25)',
                })}
              >
                {missionName || 'Unnamed Operation'}
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="hud-eyebrow text-xs text-slate-200/60">STATUS</span>
              <span
                className={cn(
                  'rounded-full border border-white/15 px-4 py-1 text-[0.72rem] font-semibold tracking-[0.45em]',
                  'bg-white/5 text-orange-200',
                )}
              >
                {missionGlyph}
              </span>
              {missionPhase ? (
                <span className="hud-mono mt-1 text-xs text-slate-300/80">{missionPhase}</span>
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
          className="relative flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/25 px-5 py-4 shadow-[0_24px_120px_rgba(4,8,20,0.35)] backdrop-blur"
        >
          <header className="flex items-center justify-between">
            <p className="hud-eyebrow">Mission Telemetry</p>
            <span className="hud-mono text-xs text-slate-300/70">Updated {updatedLabel}</span>
          </header>

          {environment ? (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
              <span className="hud-eyebrow text-[0.58rem] text-slate-200/60">SITE CONDITIONS</span>
              {typeof environment.tempF === 'number' ? (
                <span className="hud-mono text-slate-100/85">{environment.tempF.toFixed(0)}°F</span>
              ) : null}
              {environment.conditions ? (
                <span className="hud-mono text-slate-200/70">{environment.conditions}</span>
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
                    'hud-mono inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem]',
                    flag.active
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                      : 'border-slate-300/20 bg-slate-600/10 text-slate-300/70',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full',
                      flag.active ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-500',
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
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <span className="hud-mono text-xs text-slate-200/70">{watcher.label}</span>
                  <span className={cn('hud-mono text-sm uppercase tracking-[0.35em]', watcher.tone ? watcherTone[watcher.tone] : 'text-slate-100')}>
                    {watcher.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="hud-mono text-xs text-slate-300/65">Telemetry queue clear.</p>
          )}
        </motion.section>
      </div>

      <motion.footer
        {...motionPreset}
        transition={{ ...motionPreset.transition, delay: 0.28 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
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
      ? 'text-orange-200'
      : accent === 'secondary'
        ? 'text-cyan-200'
        : 'text-sky-200';

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <span className="hud-eyebrow text-[0.58rem] text-slate-200/60">{label}</span>
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
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div>
        <span className="hud-eyebrow text-[0.58rem] text-slate-200/60">{label}</span>
        <p className="hud-mono text-sm text-slate-100/85">{value}</p>
      </div>
      {icon ? <span className="text-cyan-200/80">{icon}</span> : null}
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
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
      <span className="hud-eyebrow text-[0.58rem] text-slate-200/60">{label}</span>
      <p className="hud-mono text-[0.95rem] text-slate-100/85">{value}</p>
      {secondary ? <p className="hud-mono text-xs text-slate-400/70">{secondary}</p> : null}
    </div>
  );
}

export type { OverlayMetricProps as TacticalHudOverlayMetricProps };
