import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StagePanelProps {
  title: string;
  eyebrow: string;
  subtitle?: string;
  tone?: string;
  children: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  borderColor?: string;
}

export function StagePanel({
  title,
  eyebrow,
  subtitle,
  children,
  actions,
  toolbar,
  tone = 'var(--stage-measure)',
  borderColor,
}: StagePanelProps) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border bg-[rgb(5,8,19,0.92)] p-6 shadow-[0_45px_80px_rgba(5,8,20,0.45)] backdrop-blur-3xl"
      style={{ borderColor: borderColor ?? 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-white/55"
            style={{ letterSpacing: '0.45em' }}
          >
            {eyebrow}
          </p>
          <div className="mt-1 flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <span
              className="inline-flex h-2 w-2 rounded-full"
              style={{ background: tone, boxShadow: `0 0 18px ${tone}` }}
            />
          </div>
          {subtitle ? <p className="mt-3 max-w-3xl text-sm text-white/70">{subtitle}</p> : null}
        </div>
        {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
      </div>
      <div className={cn('mt-6 space-y-6', subtitle ? 'pt-2' : '')}>{children}</div>
      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
