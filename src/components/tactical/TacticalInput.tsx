import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface TacticalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const TacticalInput = forwardRef<HTMLInputElement, TacticalInputProps>(function TacticalInput(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? `tactical-input-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <label className="block space-y-2 text-sm text-slate-200" htmlFor={inputId}>
      {label ? (
        <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.35em] text-white/70">
          <span className="inline-block h-px w-4 bg-gradient-to-r from-transparent via-white/30 to-white/60" />
          {label}
        </span>
      ) : null}
      <span
        className={cn(
          'relative block overflow-hidden rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 font-medium text-slate-100 shadow-[0_18px_42px_rgba(3,5,20,0.55)] transition-all duration-200',
          'focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/40',
          error && 'border-rose-400/70 focus-within:ring-rose-400/30',
        )}
      >
        <input
          {...props}
          id={inputId}
          ref={ref}
          className={cn(
            'w-full border-none bg-transparent font-semibold uppercase tracking-[0.2em] text-[0.75rem] text-white placeholder:text-white/40 focus:outline-none',
            className,
          )}
        />
        <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-40" />
      </span>
      {hint && !error ? (
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400/80">{hint}</span>
      ) : null}
      {error ? (
        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-300/90">{error}</span>
      ) : null}
    </label>
  );
});

