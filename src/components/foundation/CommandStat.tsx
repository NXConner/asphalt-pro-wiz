import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CommandStatTone = 'neutral' | 'positive' | 'warning' | 'critical' | 'info';
type TrendDirection = 'up' | 'down' | 'flat';

const toneStyles: Record<CommandStatTone, { badge: string; text: string }> = {
  neutral: { badge: 'bg-white/10 text-slate-100', text: 'text-slate-100' },
  positive: { badge: 'bg-emerald-500/15 text-emerald-200', text: 'text-emerald-200' },
  warning: { badge: 'bg-amber-500/20 text-amber-200', text: 'text-amber-200' },
  critical: { badge: 'bg-red-500/20 text-red-200', text: 'text-red-200' },
  info: { badge: 'bg-cyan-500/20 text-cyan-200', text: 'text-cyan-200' },
};

export interface CommandStatProps {
  label: string;
  value: string;
  tone?: CommandStatTone;
  trendLabel?: string;
  trendValue?: string;
  trendDirection?: TrendDirection;
  icon?: ReactNode;
  meta?: string;
  compact?: boolean;
  className?: string;
}

export function CommandStat({
  label,
  value,
  tone = 'neutral',
  trendLabel,
  trendValue,
  trendDirection = 'flat',
  icon,
  meta,
  compact = false,
  className,
}: CommandStatProps) {
  const styles = toneStyles[tone];
  const Icon =
    trendDirection === 'up' ? ArrowUpRight : trendDirection === 'down' ? ArrowDownRight : Minus;

  return (
    <output
      className={cn(
        'relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left shadow-[0_12px_40px_rgba(2,4,16,0.45)] backdrop-blur-xl transition-colors duration-200',
        compact && 'gap-2 p-3',
        className,
      )}
      aria-live="polite"
      value={value}
    >
      <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
        {icon ? <span className="text-base text-slate-200">{icon}</span> : null}
        <span>{label}</span>
        {meta ? (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem]">
            {meta}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <span className={cn('font-display text-4xl tracking-tight', styles.text)}>{value}</span>
        {trendValue ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em]',
              styles.badge,
            )}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {trendValue}
          </span>
        ) : null}
      </div>

      {trendLabel ? (
        <p className="text-xs text-slate-400">
          {trendLabel}
          {trendDirection === 'flat' ? ' holding steady' : null}
        </p>
      ) : null}
    </output>
  );
}
