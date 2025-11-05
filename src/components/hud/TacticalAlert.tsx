import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type AlertTone = 'info' | 'warning' | 'danger' | 'success';

interface TacticalAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  headline?: string;
  eyebrow?: string;
  dense?: boolean;
}

const TONE_CLASS: Record<AlertTone, string> = {
  info: 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100',
  warning: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
  danger: 'border-rose-400/60 bg-rose-500/10 text-rose-100',
  success: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100',
};

export const TacticalAlert = forwardRef<HTMLDivElement, TacticalAlertProps>(
  ({ tone = 'info', headline, eyebrow, dense = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-[var(--hud-radius-md)] border px-5 py-5 shadow-[0_12px_40px_rgba(8,12,24,0.45)] backdrop-blur-[16px]',
        TONE_CLASS[tone],
        dense ? 'py-4' : 'py-5',
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_15%,transparent_55%)]" aria-hidden />
      <div className="relative z-10 flex flex-col gap-2">
        {eyebrow ? (
          <span className="text-[0.6rem] uppercase tracking-[0.42em] text-white/70">{eyebrow}</span>
        ) : null}
        {headline ? (
          <h4 className="font-display text-lg uppercase tracking-[0.22em] text-white">{headline}</h4>
        ) : null}
        <div className="text-sm text-white/85">{children}</div>
      </div>
      <div className="absolute inset-y-3 right-4 w-px bg-gradient-to-b from-white/0 via-white/35 to-white/0" aria-hidden />
    </div>
  ),
);

TacticalAlert.displayName = 'TacticalAlert';

