import { forwardRef } from 'react';

import { TacticalOverlay } from './TacticalOverlay';

import type { TacticalTone } from '@/lib/tacticalTone';
import { cn } from '@/lib/utils';

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
  eyebrow?: string;
  subtitle?: string;
  accent?: 'ember' | 'aurora' | 'lagoon' | 'dusk';
  scan?: boolean;
  compact?: boolean;
  tone?: TacticalTone;
}

export const TacticalCard = forwardRef<HTMLDivElement, TacticalCardProps>(
  (
    {
      className,
      heading,
      eyebrow,
      subtitle,
      children,
      accent = 'dusk',
      scan = true,
      compact = false,
      tone,
      ...props
    },
    ref,
  ) => {
    const toneByAccent: Record<NonNullable<TacticalCardProps['accent']>, TacticalTone> = {
      ember: 'ember',
      aurora: 'aurora',
      lagoon: 'lagoon',
      dusk: 'dusk',
    };
    const resolvedTone = tone ?? toneByAccent[accent] ?? 'neutral';

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <TacticalOverlay
          className="h-full w-full"
          tone={resolvedTone}
          showScanLines={scan}
          scanLinesProps={{ opacity: scan ? 0.5 : 0, speedMs: 3000 }}
          cornerProps={{ size: compact ? 34 : 42, thickness: 2.2 }}
          gridDensity={88}
          gridOpacity={0.22}
        >
          <div
            className={cn(
              'relative z-20 flex flex-col gap-5',
              compact ? 'px-5 py-5' : 'px-8 py-8',
            )}
          >
            {(eyebrow || heading || subtitle) && (
              <header className="space-y-1">
                {eyebrow ? (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-slate-200/60">
                    {eyebrow}
                  </span>
                ) : null}
                {heading ? (
                  <h3 className="font-display text-2xl uppercase tracking-[0.18em] text-slate-50">
                    {heading}
                  </h3>
                ) : null}
                {subtitle ? (
                  <p className="font-mono text-[0.75rem] text-slate-300/70">{subtitle}</p>
                ) : null}
              </header>
            )}
            <div className="space-y-4 text-sm text-slate-100/85">{children}</div>
          </div>
        </TacticalOverlay>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5"
        />
      </div>
    );
  },
);

TacticalCard.displayName = 'TacticalCard';

