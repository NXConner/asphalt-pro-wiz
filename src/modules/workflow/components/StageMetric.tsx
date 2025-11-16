import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StageMetricProps {
  label: string;
  value: string;
  delta?: string;
  tone?: 'positive' | 'negative' | 'neutral' | 'warning';
  icon?: ReactNode;
  hint?: string;
}

const toneToClass: Record<NonNullable<StageMetricProps['tone']>, string> = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-slate-300',
  warning: 'text-amber-300',
};

export function StageMetric({ label, value, delta, tone = 'neutral', icon, hint }: StageMetricProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-[0_18px_45px_rgba(5,8,20,0.25)] transition hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
        {icon ? <span className="text-white/60">{icon}</span> : null}
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <p className="text-2xl font-semibold text-white">{value}</p>
        {delta ? (
          <span className={cn('text-sm font-medium', toneToClass[tone])}>
            {tone === 'negative' ? '▼' : tone === 'positive' ? '▲' : '•'} {delta}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-white/60">{hint}</p> : null}
    </div>
  );
}
