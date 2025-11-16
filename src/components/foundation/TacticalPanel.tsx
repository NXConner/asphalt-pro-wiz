import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface TacticalPanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: 'ember' | 'aurora' | 'lagoon' | 'rogue' | 'stealth' | 'neutral';
}

const toneBorder: Record<NonNullable<TacticalPanelProps['tone']>, string> = {
  neutral: 'border-white/10',
  ember: 'border-orange-400/30',
  aurora: 'border-cyan-400/30',
  lagoon: 'border-sky-400/30',
  rogue: 'border-red-500/40',
  stealth: 'border-emerald-400/30',
};

export function TacticalPanel({
  title,
  description,
  action,
  children,
  className,
  tone = 'neutral',
}: TacticalPanelProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border bg-slate-950/70 p-6 shadow-[0_30px_120px_rgba(3,5,20,0.55)] backdrop-blur-xl',
        toneBorder[tone],
        className,
      )}
    >
      {(title || description || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? (
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200">
                {title}
              </h3>
            ) : null}
            {description ? <p className="text-xs text-slate-300/75">{description}</p> : null}
          </div>
          {action ? <div className="flex-shrink-0">{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
