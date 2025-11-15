import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type HoloTone = 'ember' | 'aurora' | 'lagoon' | 'dusk' | 'citadel' | 'chapel';

const toneBackground: Record<HoloTone, string[]> = {
  ember: ['before:from-orange-500/25', 'before:via-rose-500/15', 'before:to-amber-400/20'],
  aurora: ['before:from-cyan-400/20', 'before:via-emerald-400/10', 'before:to-sky-500/25'],
  lagoon: ['before:from-sky-500/20', 'before:via-indigo-500/10', 'before:to-fuchsia-500/25'],
  dusk: ['before:from-purple-500/20', 'before:via-blue-500/15', 'before:to-slate-500/20'],
  citadel: ['before:from-amber-400/20', 'before:via-slate-400/10', 'before:to-emerald-400/20'],
  chapel: ['before:from-amber-300/18', 'before:via-slate-200/12', 'before:to-sky-300/18'],
};

const toneBorder: Record<HoloTone, string> = {
  ember: 'border-orange-400/30',
  aurora: 'border-emerald-300/30',
  lagoon: 'border-sky-300/30',
  dusk: 'border-violet-300/30',
  citadel: 'border-amber-300/30',
  chapel: 'border-amber-200/45',
};

export interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: HoloTone;
  glow?: boolean;
}

export const HoloCard = forwardRef<HTMLDivElement, HoloCardProps>(
  ({ className, tone = 'aurora', glow = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-3xl border bg-slate-950/70 p-px shadow-[0_28px_160px_rgba(8,12,24,0.55)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-0.5 hover:shadow-[0_42px_200px_rgba(8,12,24,0.65)]',
        toneBorder[tone],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'rounded-[calc(1.5rem-1px)] border border-white/5 bg-slate-950/80',
          glow &&
            'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:opacity-80',
          glow && toneBackground[tone],
          'relative flex h-full flex-col gap-5 p-6',
        )}
      >
        {children}
      </div>
    </div>
  ),
);

HoloCard.displayName = 'HoloCard';

export const HoloCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between gap-4', className)} {...props} />
  ),
);

HoloCardHeader.displayName = 'HoloCardHeader';

export const HoloCardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const content = children || <span className="sr-only">Card title</span>;
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold uppercase tracking-[0.32em] text-slate-100 drop-shadow-[0_4px_18px_rgba(15,23,42,0.45)]',
        className,
      )}
      {...props}
    >
      {content}
    </h3>
  );
});

HoloCardTitle.displayName = 'HoloCardTitle';

export const HoloCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-slate-300/75 leading-relaxed', className)} {...props} />
));

HoloCardDescription.displayName = 'HoloCardDescription';

export const HoloCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center justify-between gap-3 pt-1', className)}
      {...props}
    />
  ),
);

HoloCardFooter.displayName = 'HoloCardFooter';

export const AccentSwatch = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-3',
      className,
    )}
  >
    <span
      className="h-8 w-8 rounded-lg border border-white/20"
      style={{ background: `hsl(${value})` }}
      aria-hidden="true"
    />
    <div className="space-y-1">
      <span className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">{label}</span>
      <code className="text-xs text-slate-100">{value}</code>
    </div>
  </div>
);

AccentSwatch.displayName = 'AccentSwatch';
