import { memo, useMemo } from 'react';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  showPercentage?: boolean;
}

const FULL_CIRCLE = 2 * Math.PI;

const ProgressRingComponent = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  className,
  label,
  showPercentage = true,
}: ProgressRingProps) => {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => FULL_CIRCLE * radius, [radius]);
  const clamped = Math.min(max, Math.max(0, value));
  const progress = circumference - (clamped / max) * circumference;
  const percentage = Math.round((clamped / max) * 100);

  return (
    <div className={cn('relative inline-flex flex-col items-center gap-2', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-slate-600/40"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-orange-400 drop-shadow-[0_0_8px_rgba(255,128,0,0.45)] transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage ? (
          <span className="font-display text-2xl text-slate-50">{percentage}</span>
        ) : null}
        <span className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-300/70">
          {label}
        </span>
      </div>
    </div>
  );
};

export const ProgressRing = memo(ProgressRingComponent);

