import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type StatusTone = 'neutral' | 'positive' | 'warning' | 'critical' | 'info';
type Emphasis = 'solid' | 'outline';

const toneMap: Record<StatusTone, { solid: string; outline: string }> = {
  neutral: {
    solid: 'bg-slate-200/20 text-slate-100',
    outline: 'border border-slate-400/40 text-slate-200',
  },
  positive: {
    solid: 'bg-emerald-500/30 text-emerald-50',
    outline: 'border border-emerald-300/50 text-emerald-200',
  },
  warning: {
    solid: 'bg-amber-500/30 text-amber-50',
    outline: 'border border-amber-300/50 text-amber-200',
  },
  critical: {
    solid: 'bg-red-500/25 text-red-100',
    outline: 'border border-red-400/60 text-red-200',
  },
  info: {
    solid: 'bg-cyan-500/25 text-cyan-50',
    outline: 'border border-cyan-300/60 text-cyan-100',
  },
};

export interface StatusPillProps {
  children: ReactNode;
  tone?: StatusTone;
  emphasis?: Emphasis;
  icon?: ReactNode;
  className?: string;
}

export function StatusPill({
  children,
  tone = 'neutral',
  emphasis = 'outline',
  icon,
  className,
}: StatusPillProps) {
  const styles = toneMap[tone][emphasis];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em]',
        styles,
        className,
      )}
    >
      {icon ? <span className="text-xs">{icon}</span> : null}
      {children}
    </span>
  );
}
