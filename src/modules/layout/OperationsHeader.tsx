import {
  Droplets,
  Gauge,
  LayoutDashboard,
  LogIn,
  LogOut,
  Shield,
  Sparkles,
  SwitchCamera,
} from 'lucide-react';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { CanvasWallpaper } from './wallpapers';

import { CornerBrackets } from '@/components/hud';
import { RealtimeNotifications } from '@/components/RealtimeNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { UserPresence } from '@/components/UserPresence';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { isEnabled } from '@/lib/flags';
import { cn } from '@/lib/utils';

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
    return '–';
  }
  if (value > 100000) {
    return `${(value / 1000).toFixed(1)}k sq ft`;
  }
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq ft`;
}

function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '–';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  }).format(value);
}

export const OperationsHeader = memo(function OperationsHeader({
  wallpaper,
  onNextWallpaper,
  summary,
}: OperationsHeaderProps) {
  const commandCenterEnabled = isEnabled('commandCenter');
  const { isAuthenticated, signOut, user } = useAuthContext();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      {/* Tactical corner brackets */}
      <CornerBrackets
        size={32}
        thickness={1.5}
        offset={0}
        glow={true}
        animated={false}
        className="pointer-events-none absolute -left-2 -top-2 z-0 opacity-60"
      />
      <CornerBrackets
        size={32}
        thickness={1.5}
        offset={0}
        glow={true}
        animated={false}
        className="pointer-events-none absolute -right-2 -top-2 z-0 opacity-60"
      />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.5em] text-slate-200/70">
          <Sparkles className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
          <span className="text-glow-ember">Operations Canvas : Tactical Command</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-4xl uppercase tracking-[0.28em] text-slate-50 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl">
            {summary.jobName ? summary.jobName : 'New Pavement Mission'}
          </h1>
          <p className="max-w-2xl font-mono text-xs uppercase tracking-[0.45em] text-slate-200/70 sm:text-sm">
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
          <span className="group relative inline-flex items-center overflow-hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-50/80 backdrop-blur-sm transition-all duration-300 hover:border-orange-400/40 hover:bg-white/15 hover:shadow-[0_0_16px_rgba(251,146,60,0.3)]">
            <span
              className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.1)_10%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <span className="relative">{wallpaper.name}</span>
          </span>
        </div>
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-end gap-3">
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
        {isAuthenticated && isAdmin && (
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="border-white/10 bg-white/10 text-slate-50 hover:bg-white/20"
          >
            <Link to="/admin">
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Link>
          </Button>
        )}
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
        <UserPresence />
        <RealtimeNotifications />
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
        'group relative inline-flex items-center gap-3 overflow-hidden rounded-[var(--hud-radius-md)] border border-white/15 bg-white/5 px-4 py-3',
        'text-left text-sm font-medium text-slate-50/90 shadow-[0_18px_45px_rgba(8,12,24,0.45)] backdrop-blur-lg',
        'transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:shadow-[0_24px_60px_rgba(8,12,24,0.6),0_0_20px_rgba(251,146,60,0.2)]',
      )}
    >
      <span
        className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12)_10%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.4)] transition-shadow duration-300 group-hover:shadow-[0_0_16px_rgba(251,146,60,0.6)]">
        {icon}
      </span>
      <span className="relative flex flex-col leading-tight">
        <span className="text-[0.65rem] uppercase tracking-[0.42em] text-slate-200/70">
          {label}
        </span>
        <span className="font-mono text-sm text-slate-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          {value}
        </span>
      </span>
    </span>
  );
}
