import { Maximize2, Minimize2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { ParticleBackground, ScanOverlay } from '@/components/hud';
import { TacticalOverlay } from '@/components/hud/TacticalOverlay';
import { Button } from '@/components/ui/button';
import type { ParticlePresetKey } from '@/design';
import { cn } from '@/lib/utils';
import type { TacticalTone } from '@/lib/tacticalTone';

export type CanvasTone = 'dusk' | 'aurora' | 'ember' | 'lagoon';

const GRADIENT_MAP: Record<CanvasTone, string> = {
  dusk: 'from-orange-500/25 via-orange-500/10 to-transparent',
  aurora: 'from-cyan-400/25 via-emerald-400/10 to-transparent',
  ember: 'from-rose-500/25 via-amber-400/10 to-transparent',
  lagoon: 'from-indigo-500/22 via-blue-500/10 to-transparent',
};

const BORDER_ACCENT: Record<CanvasTone, string> = {
  dusk: 'border-orange-400/40',
  aurora: 'border-cyan-300/40',
  ember: 'border-rose-400/40',
  lagoon: 'border-indigo-400/40',
};

const BADGE_COLORS: Record<CanvasTone, string> = {
  dusk: 'bg-orange-500/20 text-orange-200',
  aurora: 'bg-cyan-500/20 text-cyan-100',
  ember: 'bg-rose-500/20 text-rose-100',
  lagoon: 'bg-indigo-500/20 text-indigo-100',
};

const PARTICLE_MAP: Record<CanvasTone, ParticlePresetKey> = {
  dusk: 'ember',
  aurora: 'tech',
  ember: 'rogue',
  lagoon: 'command',
};

const TONE_MAP: Record<CanvasTone, TacticalTone> = {
  dusk: 'dusk',
  aurora: 'aurora',
  ember: 'ember',
  lagoon: 'lagoon',
};

interface CanvasPanelProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tone?: CanvasTone;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapseId?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function CanvasPanel({
  title,
  subtitle,
  eyebrow,
  tone = 'dusk',
  badge,
  action,
  children,
  className,
  id,
  collapsible = false,
  defaultCollapsed = false,
  collapseId,
  onCollapseChange,
}: CanvasPanelProps) {
  const collapseKey = useMemo(() => {
    if (!collapsible) return null;
    if (collapseId) return `pps:panel:${collapseId}`;
    if (id) return `pps:panel:${id}`;
    return null;
  }, [collapsible, collapseId, id]);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (!collapsible) return false;
    if (typeof window === 'undefined') return defaultCollapsed;
    if (!collapseKey) return defaultCollapsed;
    try {
      const stored = window.localStorage.getItem(collapseKey);
      if (stored === '1') return true;
      if (stored === '0') return false;
    } catch {}
    return defaultCollapsed;
  });

  useEffect(() => {
    if (!collapsible || !collapseKey) return;
    try {
      window.localStorage.setItem(collapseKey, collapsed ? '1' : '0');
    } catch {}
  }, [collapsible, collapseKey, collapsed]);

  useEffect(() => {
    if (!collapsible) return;
    onCollapseChange?.(collapsed);
  }, [collapsible, collapsed, onCollapseChange]);

  const bodyId = useMemo(() => {
    if (!collapsible) return undefined;
    if (collapseId) return `${collapseId}-panel-body`;
    if (id) return `${id}-panel-body`;
    return undefined;
  }, [collapsible, collapseId, id]);

  const toggleCollapse = () => {
    if (!collapsible) return;
    setCollapsed((prev) => !prev);
  };

    return (
      <section id={id} className={cn('relative', className)}>
        <TacticalOverlay
          tone={TONE_MAP[tone]}
          className="rounded-[var(--hud-radius-lg)] border border-white/12 text-slate-50 shadow-[0_18px_48px_rgba(8,12,24,0.45)] backdrop-blur-sm transition-all duration-200"
          gridDensity={tone === 'aurora' ? 88 : tone === 'lagoon' ? 92 : 84}
          scanLinesProps={{
            opacity: 0.28,
            density: tone === 'ember' ? 68 : 72,
            speedMs: tone === 'ember' ? 3200 : 3600,
          }}
          cornerProps={{
            size: 44,
            thickness: 2,
            glow: true,
            pulseDelayMs: 180,
            offset: 6,
          }}
        >
          <ParticleBackground
            preset={PARTICLE_MAP[tone]}
            className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen"
          />
          <ScanOverlay className="pointer-events-none absolute inset-0 opacity-25" color="rgba(255,128,0,0.18)" />
          <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-9">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex-1 space-y-1">
                {eyebrow ? (
                  <span className="font-semibold uppercase tracking-[0.5em] text-[0.65rem] text-slate-200/60">
                    {eyebrow}
                  </span>
                ) : null}
                <h2 className="font-display text-3xl uppercase tracking-[0.18em] text-slate-50 sm:text-[2.35rem]">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="font-mono text-sm text-slate-200/75 sm:text-[0.95rem]">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex items-start gap-3">
                {badge ? (
                  <span
                    className={cn('rounded-full px-3 py-1 text-xs font-semibold', BADGE_COLORS[tone])}
                  >
                    {badge}
                  </span>
                ) : null}
                {action}
                {collapsible ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={toggleCollapse}
                    aria-expanded={!collapsed}
                    aria-controls={bodyId}
                  >
                    {collapsed ? (
                      <Maximize2 className="h-4 w-4" aria-hidden />
                    ) : (
                      <Minimize2 className="h-4 w-4" aria-hidden />
                    )}
                    <span className="sr-only">
                      {collapsed ? `Expand ${title}` : `Collapse ${title}`}
                    </span>
                  </Button>
                ) : null}
              </div>
            </header>
            <div
              id={bodyId}
              hidden={collapsible && collapsed}
              aria-hidden={collapsible && collapsed}
              className="space-y-6 text-sm leading-relaxed text-slate-100/90 sm:text-base"
            >
              {collapsible && collapsed ? null : children}
            </div>
          </div>
        </TacticalOverlay>
      </section>
    );
}
