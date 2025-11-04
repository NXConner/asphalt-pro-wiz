import { forwardRef } from 'react';

import { CanvasGrid } from './CanvasGrid';
import { CornerBracket } from './CornerBracket';
import { ScanOverlay } from './ScanOverlay';

import { cn } from '@/lib/utils';

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
  eyebrow?: string;
  subtitle?: string;
  accent?: 'ember' | 'aurora' | 'lagoon' | 'dusk';
  scan?: boolean;
  compact?: boolean;
}

export const TacticalCard = forwardRef<HTMLDivElement, TacticalCardProps>(
  ({
    className,
    heading,
    eyebrow,
    subtitle,
    children,
    accent = 'dusk',
    scan = true,
    compact = false,
    ...props
  }, ref) => {
    const accentClass = {
      ember: 'from-rose-500/20 via-orange-500/15 to-transparent border-rose-400/40',
      aurora: 'from-cyan-400/20 via-emerald-400/15 to-transparent border-cyan-300/40',
      lagoon: 'from-indigo-400/18 via-blue-500/12 to-transparent border-indigo-400/40',
      dusk: 'from-orange-400/22 via-amber-300/10 to-transparent border-orange-400/40',
    }[accent];

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-[var(--hud-radius-lg)] border border-white/10 bg-slate-950/60 shadow-[0_25px_80px_rgba(8,12,24,0.55)] backdrop-blur-[var(--hud-panel-blur)] transition-transform duration-300 hover:-translate-y-1',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-70',
            accentClass,
          )}
        />
        <CanvasGrid className="opacity-[var(--hud-grid-opacity)]" />
        {scan ? <ScanOverlay className="opacity-60" /> : null}
        <CornerBracket size={42} />
        <div className={cn('relative z-10 flex flex-col gap-5', compact ? 'p-5' : 'p-8')}> 
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
      </div>
    );
  },
);

TacticalCard.displayName = 'TacticalCard';

