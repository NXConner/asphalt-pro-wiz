import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type CanvasTone = "dusk" | "aurora" | "ember" | "lagoon";

const OVERLAY_MAP: Record<CanvasTone, string> = {
  dusk: "bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.45)_0%,_transparent_65%)]",
  aurora: "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.45)_0%,_transparent_60%)]",
  ember: "bg-[radial-gradient(circle_at_bottom,_rgba(239,68,68,0.42)_0%,_transparent_60%)]",
  lagoon: "bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.45)_0%,_transparent_65%)]",
};

const BORDER_ACCENT: Record<CanvasTone, string> = {
  dusk: "border-orange-400/40",
  aurora: "border-cyan-300/40",
  ember: "border-rose-400/40",
  lagoon: "border-indigo-400/40",
};

const BADGE_COLORS: Record<CanvasTone, string> = {
  dusk: "bg-orange-500/20 text-orange-200",
  aurora: "bg-cyan-500/20 text-cyan-100",
  ember: "bg-rose-500/20 text-rose-100",
  lagoon: "bg-indigo-500/20 text-indigo-100",
};

interface CanvasPanelProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tone?: CanvasTone;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function CanvasPanel({
  title,
  subtitle,
  eyebrow,
  tone = "dusk",
  badge,
  action,
  children,
  className,
  id,
}: CanvasPanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-slate-950/40 text-slate-50 shadow-2xl backdrop-blur-xl",
        BORDER_ACCENT[tone],
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-80 mix-blend-screen", OVERLAY_MAP[tone])} />
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex-1 space-y-1">
            {eyebrow ? (
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-200/70">
                {eyebrow}
              </span>
            ) : null}
            <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
            {subtitle ? <p className="text-sm text-slate-200/80 sm:text-base">{subtitle}</p> : null}
          </div>
          <div className="flex items-start gap-3">
            {badge ? (
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", BADGE_COLORS[tone])}>
                {badge}
              </span>
            ) : null}
            {action}
          </div>
        </header>
        <div className="space-y-6 text-sm leading-relaxed text-slate-100/90 sm:text-base">
          {children}
        </div>
      </div>
    </section>
  );
}
