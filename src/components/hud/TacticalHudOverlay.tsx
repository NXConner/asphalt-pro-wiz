import { motion } from 'framer-motion';
import { Sparkles, TimerReset, ChevronDown, Maximize2, Minimize2, GripVertical, Pin, PinOff } from 'lucide-react';
import { memo, useState, useEffect, useCallback, useRef } from 'react';

import { mergeHudTypography } from '@/design';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleHudSection } from './CollapsibleHudSection';
import { Button } from '@/components/ui/button';

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
  const { preferences, setHudPosition, setHudPinned, setHudSize, setHudLayoutPreset } = useTheme();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
      if (preferences.hudLayoutPreset !== 'custom' && !isMobile) {
        window.dispatchEvent(new CustomEvent('hudLayoutUpdate'));
      }
    };
    
    const handleLayoutShortcut = (e: CustomEvent<string>) => {
      if (e.detail) {
        setHudLayoutPreset(e.detail as any);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('setHudLayout', handleLayoutShortcut as EventListener);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('setHudLayout', handleLayoutShortcut as EventListener);
    };
  }, [preferences.hudLayoutPreset, isMobile, setHudLayoutPreset]);
  
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
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
      animate={{ 
        opacity: 1, 
        x: preferences.hudPosition?.x ?? 0, 
        y: preferences.hudPosition?.y ?? 0,
        width: isMobile ? '100%' : preferences.hudSize.width,
        height: isMobile ? (isExpanded ? '85vh' : 80) : preferences.hudSize.height,
      }}
      exit={{ opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }}
      transition={{ 
        ...motionPreset,
        width: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        x: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      drag={!isMobile && !preferences.hudPinned}
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ top: 0, left: 0, right: window.innerWidth - 400, bottom: window.innerHeight - 200 }}
      onDragEnd={(_, info) => {
        if (!isMobile && !preferences.hudPinned) {
          setHudPosition({ x: info.point.x, y: info.point.y });
        }
      }}
      className={cn(
        'pointer-events-auto fixed z-[60] flex flex-col overflow-hidden shadow-2xl backdrop-blur-md',
        isMobile
          ? 'bottom-0 left-0 right-0 rounded-t-3xl border-t border-x border-border/50'
          : 'rounded-2xl border border-border/50',
        className,
      )}
      style={{
        backdropFilter: `blur(${preferences.hudBlur}px)`,
        backgroundColor: `hsl(var(--card) / ${preferences.hudOpacity})`,
        transition: preferences.hudAnimationsEnabled ? 'backdrop-filter 0.3s ease, background-color 0.3s ease' : 'none',
      }}
    >
      {/* Header with drag handle and expand/collapse */}
      <header className="flex items-center gap-3 border-b border-border/30 p-4 touch-manipulation">
        {!isMobile && (
          <button
            className={cn(
              'touch-none',
              preferences.hudPinned ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
            )}
            aria-label={preferences.hudPinned ? 'HUD is pinned' : 'Drag to reposition HUD'}
            disabled={preferences.hudPinned}
          >
            <GripVertical className={cn('h-5 w-5', preferences.hudPinned ? 'text-muted-foreground/40' : 'text-muted-foreground')} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-base font-semibold uppercase tracking-wide text-foreground">
            {missionName || 'Mission Brief'}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isMobile && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setHudPinned(!preferences.hudPinned)}
              className="h-8 w-8 p-0"
              aria-label={preferences.hudPinned ? 'Unpin HUD' : 'Pin HUD'}
            >
              {preferences.hudPinned ? (
                <Pin className="h-4 w-4 text-primary" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
          )}
          <span
            className={cn(
              'rounded-full border border-primary/40 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.35em]',
              'bg-primary/10 text-primary-foreground',
            )}
          >
            {missionGlyph}
          </span>
          {isMobile && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-9 w-9 p-0"
              aria-label={isExpanded ? 'Collapse HUD' : 'Expand HUD'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Body - collapsible on mobile */}
      {(!isMobile || isExpanded) && (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
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
        </div>
      )}

      {/* Footer - compact view on mobile when collapsed */}
      {isMobile && !isExpanded && (
        <div className="grid grid-cols-3 gap-2 border-t border-border/30 px-4 py-2 text-xs">
          <div>
            <span className="text-muted-foreground">Budget</span>
            <p className="font-semibold text-foreground">{formattedCost}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Area</span>
            <p className="font-semibold text-foreground">{formattedArea}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Travel</span>
            <p className="font-semibold text-foreground">{formattedTravel}</p>
          </div>
        </div>
      )}
    </motion.div>
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

export type { OverlayMetricProps as TacticalHudOverlayMetricProps };
