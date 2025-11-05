import { memo } from 'react';

import { cn } from '@/lib/utils';

interface StatusBarProps {
  value: number;
  max?: number;
  criticalThreshold?: number;
  warningThreshold?: number;
  label?: string;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const StatusBarComponent = ({
  value,
  max = 100,
  criticalThreshold = 0.15,
  warningThreshold = 0.35,
  label,
  className,
}: StatusBarProps) => {
  const ratio = clamp(value / max, 0, 1);
  const percentage = Math.round(ratio * 100);

  const statusClass = ratio <= criticalThreshold
    ? 'from-rose-500/60 via-rose-500/40 to-rose-500/10'
    : ratio <= warningThreshold
      ? 'from-amber-400/60 via-amber-400/35 to-amber-400/10'
      : 'from-cyan-400/60 via-cyan-400/35 to-cyan-400/10';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.45em] text-slate-200/70">
          <span>{label}</span>
          <span className="font-mono text-[0.7rem] text-slate-100/80">{percentage}%</span>
        </div>
      ) : null}
      <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn('absolute inset-y-0 rounded-full bg-gradient-to-r transition-all duration-500', statusClass)}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 grid grid-cols-12 opacity-[0.25]">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="border-r border-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatusBar = memo(StatusBarComponent);

