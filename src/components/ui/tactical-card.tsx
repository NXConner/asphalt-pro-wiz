import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TacticalTone = 'ember' | 'dusk' | 'aurora' | 'lagoon';

interface TacticalCardProps {
  tone?: TacticalTone;
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
}

const toneBackground: Record<TacticalTone, string> = {
  ember: 'from-orange-500/30 via-orange-500/10 to-slate-900/60 border-orange-400/40',
  dusk: 'from-indigo-500/30 via-slate-800/60 to-black/80 border-indigo-400/30',
  aurora: 'from-emerald-400/20 via-slate-900/70 to-black/80 border-emerald-400/30',
  lagoon: 'from-cyan-400/25 via-slate-900/70 to-black/80 border-cyan-400/30',
};

export function TacticalCard({
  tone = 'dusk',
  title,
  eyebrow,
  description,
  actions,
  children,
  className,
  contentClassName,
  footer,
}: TacticalCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border bg-gradient-to-br p-0 shadow-[0_30px_80px_rgba(2,4,24,0.65)]',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_55%)] before:opacity-60',
        'after:pointer-events-none after:absolute after:-inset-[1px] after:border after:border-white/5 after:rounded-[inherit]',
        toneBackground[tone],
        className,
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        {(eyebrow || title || actions) && (
          <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {eyebrow ? (
                <p className="text-[0.55rem] font-mono uppercase tracking-[0.55em] text-white/60">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-white sm:text-xl">{title}</span>
                </div>
              ) : null}
              {description ? (
                <p className="text-sm text-white/70">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex gap-2">{actions}</div> : null}
          </header>
        )}

        <section className={cn('space-y-4 text-sm text-white/85', contentClassName)}>{children}</section>

        {footer ? (
          <footer className="border-t border-white/10 pt-3 text-xs text-white/70">
            {footer}
          </footer>
        ) : null}
      </div>
    </Card>
  );
}
