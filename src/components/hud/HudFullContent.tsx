import { Sparkles, TimerReset } from 'lucide-react';
import { memo } from 'react';

import { CollapsibleHudSection } from './CollapsibleHudSection';

import { cn } from '@/lib/utils';

interface HudFullContentProps {
  formattedCost: string;
  formattedArea: string;
  formattedTravel: string;
  formattedCoords: string;
  formattedWindow: string;
  updatedLabel: string;
  missionPhase?: string;
  isMobile: boolean;
  environment?: {
    tempF?: number;
    conditions?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  };
  watchers?: Array<{ label: string; value: string; tone?: 'ok' | 'warn' | 'critical' }>;
  flags?: Array<{ id: string; label: string; active: boolean }>;
}

const riskTone: Record<'low' | 'medium' | 'high', string> = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

const watcherTone: Record<'ok' | 'warn' | 'critical', string> = {
  ok: 'text-success',
  warn: 'text-warning',
  critical: 'text-destructive',
};

export const HudFullContent = memo(function HudFullContent({
  formattedCost,
  formattedArea,
  formattedTravel,
  formattedCoords,
  formattedWindow,
  updatedLabel,
  missionPhase,
  isMobile,
  environment,
  watchers,
  flags,
}: HudFullContentProps) {
  return (
    <>
      {/* Mission Details */}
      <CollapsibleHudSection title="Mission Details" defaultOpen={true}>
        <div className="grid gap-3">
          <OverlayMetric label="Mission Budget" value={formattedCost} accent="accent" />
          <OverlayMetric label="Surface Footprint" value={formattedArea} accent="secondary" />
          <OverlayMetric label="Travel Logistics" value={formattedTravel} accent="primary" />
        </div>

        <div className="mt-3 grid gap-2">
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
      </CollapsibleHudSection>

      {/* Telemetry */}
      <CollapsibleHudSection 
        title="Mission Telemetry" 
        defaultOpen={!isMobile}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Updated {updatedLabel}</span>
            {missionPhase && (
              <span className="text-xs text-muted-foreground">{missionPhase}</span>
            )}
          </div>

          {environment && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-xs">
              <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">SITE CONDITIONS</span>
              {typeof environment.tempF === 'number' && (
                <span className="text-foreground/85">{environment.tempF.toFixed(0)}°F</span>
              )}
              {environment.conditions && (
                <span className="text-foreground/70">{environment.conditions}</span>
              )}
              {environment.riskLevel && (
                <span className={cn('uppercase tracking-[0.35em]', riskTone[environment.riskLevel])}>
                  {environment.riskLevel} risk
                </span>
              )}
            </div>
          )}

          {watchers && watchers.length > 0 && (
            <div className="grid gap-2">
              {watchers.map((watcher) => (
                <div
                  key={watcher.label}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">{watcher.label}</span>
                  <span className={cn('text-sm uppercase tracking-[0.35em]', watcher.tone ? watcherTone[watcher.tone] : 'text-foreground')}>
                    {watcher.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleHudSection>

      {/* Flags */}
      {flags && flags.length > 0 && (
        <CollapsibleHudSection title="Active Flags" defaultOpen={!isMobile}>
          <ul className="flex flex-wrap gap-2">
            {flags.map((flag) => (
              <li
                key={flag.id}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem]',
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
        </CollapsibleHudSection>
      )}
    </>
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
    <article className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
      <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className={cn('mt-1 text-sm font-mono', accentClass)}>{value}</p>
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
    <article className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
      <div>
        <span className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">{label}</span>
        <p className="text-sm text-foreground/85 font-mono">{value}</p>
      </div>
      {icon && <span className="text-accent/80">{icon}</span>}
    </article>
  );
}
