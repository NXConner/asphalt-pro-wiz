import { memo } from "react";
import { Droplets, Gauge, LayoutDashboard, LogIn, LogOut, Sparkles, SwitchCamera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isEnabled } from "@/lib/flags";
import { useAuthContext } from "@/contexts/AuthContext";

import type { CanvasWallpaper } from "./wallpapers";

interface OperationsHeaderProps {
  wallpaper: CanvasWallpaper;
  onNextWallpaper: () => void;
  summary: {
    jobName: string;
    totalArea: number;
    totalCost: number | null;
  };
}

function formatArea(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "–";
  }
  if (value > 100000) {
    return `${(value / 1000).toFixed(1)}k sq ft`;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft`;
}

function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "–";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  }).format(value);
}

export const OperationsHeader = memo(function OperationsHeader({
  wallpaper,
  onNextWallpaper,
  summary,
}: OperationsHeaderProps) {
  const commandCenterEnabled = isEnabled("commandCenter");
  const { isAuthenticated, signOut, user } = useAuthContext();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-slate-200/70">
          <Sparkles className="h-4 w-4" />
          <span>Operations Canvas</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {summary.jobName ? summary.jobName : "New Pavement Mission"}
          </h1>
          <p className="max-w-2xl text-sm text-slate-100/80 sm:text-base">
            {wallpaper.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatPill
            icon={<Gauge className="h-4 w-4" />}
            label="Total Scope"
            value={formatArea(summary.totalArea)}
          />
          <StatPill
            icon={<Droplets className="h-4 w-4" />}
            label="Projected Quote"
            value={formatCurrency(summary.totalCost)}
          />
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-50/80">
            {wallpaper.name}
          </span>
        </div>
      </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {commandCenterEnabled ? (
            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              <Link to="/command-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Open Command Center
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="border-white/10 bg-white/10 text-slate-50 hover:bg-white/20"
            onClick={onNextWallpaper}
          >
            <SwitchCamera className="mr-2 h-4 w-4" />
            Cycle Atmosphere
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="border-white/10 bg-white/10 text-slate-50 hover:bg-white/20"
            onClick={handleAuthAction}
            title={isAuthenticated ? user?.email : 'Sign in'}
          >
            {isAuthenticated ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
          <ThemeToggle />
        </div>
    </header>
  );
});

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2",
        "text-left text-sm font-medium text-slate-50/90 shadow-lg backdrop-blur-md",
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-slate-100">
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs uppercase tracking-widest text-slate-200/70">{label}</span>
        <span className="text-sm font-semibold text-slate-50">{value}</span>
      </span>
    </span>
  );
}
