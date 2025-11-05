import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type DivisionCardVariant = 'default' | 'command' | 'intel' | 'alert';

const VARIANT_STYLE: Record<DivisionCardVariant, string> = {
  default:
    'border-white/12 bg-slate-950/55 before:bg-[radial-gradient(circle_at_top,_rgba(128,200,255,0.12),transparent_55%)]',
  command:
    'border-cyan-400/35 bg-slate-950/65 before:bg-[radial-gradient(circle_at_top,_rgba(34,197,252,0.22),transparent_60%)]',
  intel:
    'border-emerald-400/35 bg-slate-950/60 before:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),transparent_60%)]',
  alert:
    'border-rose-400/40 bg-[#160b12]/80 before:bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.28),transparent_60%)]',
};

export interface DivisionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DivisionCardVariant;
  subdued?: boolean;
}

export const DivisionCard = forwardRef<HTMLDivElement, DivisionCardProps>(
  ({ variant = 'default', subdued = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-[28px] border px-6 py-6 shadow-[0_32px_120px_rgba(3,6,16,0.45)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_42px_160px_rgba(3,6,16,0.6)]',
        VARIANT_STYLE[variant],
        subdued ? 'opacity-85' : 'opacity-100',
        'before:absolute before:inset-[-20%] before:-z-10 before:opacity-70 before:transition-opacity before:duration-500 group-hover:before:opacity-90',
        className,
      )}
      {...props}
    >
      <div className="relative z-10 flex flex-col gap-5">{children}</div>
    </div>
  ),
);
DivisionCard.displayName = 'DivisionCard';

export interface DivisionCardHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function DivisionCardHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  align = 'start',
}: DivisionCardHeaderProps) {
  return (
    <header
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', {
        'sm:text-center': align === 'center',
        'sm:text-right': align === 'end',
      })}
    >
      <div className={cn('space-y-2', align === 'center' ? 'sm:mx-auto sm:text-center' : '')}>
        {eyebrow ? <p className="hud-eyebrow text-[0.58rem] text-slate-200/65">{eyebrow}</p> : null}
        <h3 className="text-hud-title-lg text-slate-50">{title}</h3>
        {subtitle ? <p className="hud-body text-sm text-slate-200/75">{subtitle}</p> : null}
      </div>
      <div className="flex flex-col items-end gap-2 sm:items-end">
        {badge}
        {actions}
      </div>
    </header>
  );
}

interface DivisionCardMetricProps {
  label: string;
  value: string;
  delta?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'critical';
}

const METRIC_TONE: Record<NonNullable<DivisionCardMetricProps['tone']>, string> = {
  neutral: 'text-slate-200',
  positive: 'text-emerald-300',
  warning: 'text-amber-300',
  critical: 'text-rose-300',
};

export function DivisionCardMetric({
  label,
  value,
  delta,
  tone = 'neutral',
}: DivisionCardMetricProps) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
      <p className="hud-eyebrow text-[0.58rem] text-slate-200/60">{label}</p>
      <p className={cn('hud-mono text-lg', METRIC_TONE[tone])}>{value}</p>
      {delta ? <p className="hud-mono text-xs text-slate-300/70">{delta}</p> : null}
    </div>
  );
}

interface DivisionCardListItem {
  id: string | number;
  headline: string;
  subline?: string;
  meta?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'critical';
}

export function DivisionCardList({ items }: { items: DivisionCardListItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const toneClass = item.tone ? METRIC_TONE[item.tone] : 'text-slate-100/85';
        return (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="space-y-1">
              <p className="hud-mono text-sm text-slate-100/90">{item.headline}</p>
              {item.subline ? (
                <p className="hud-mono text-xs text-slate-300/70">{item.subline}</p>
              ) : null}
            </div>
            {item.meta ? (
              <span className={cn('hud-mono text-xs uppercase tracking-[0.3em]', toneClass)}>
                {item.meta}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function DivisionCardBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="hud-mono inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] text-slate-200/80">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      {children}
    </span>
  );
}

export function DivisionCardDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-500/40 to-transparent" />
  );
}
