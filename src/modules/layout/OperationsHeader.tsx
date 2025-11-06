import {
  Activity,
  DollarSign,
  Droplets,
  Gauge,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  PieChart,
  Shield,
  Sparkles,
  SwitchCamera,
} from 'lucide-react';
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import type { CanvasWallpaper } from './wallpapers';

import { RealtimeNotifications } from '@/components/RealtimeNotifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPresence } from '@/components/UserPresence';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useJobTelemetryStats } from '@/hooks/useTelemetry';
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

const STATUS_LABEL_LOOKUP: Record<string, string> = {
  pending: 'Pending Intake',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  on_hold: 'On Hold',
};

const STATUS_COLOR_LOOKUP: Record<string, string> = {
  pending: '#60a5fa',
  scheduled: '#fbbf24',
  in_progress: '#34d399',
  completed: '#a855f7',
  cancelled: '#f87171',
  on_hold: '#facc15',
};

const STATUS_ORDER: readonly string[] = ['in_progress', 'scheduled', 'pending', 'completed', 'on_hold', 'cancelled'] as const;
const STATUS_DISTRIBUTION_SKELETON_ROWS = [0, 1, 2, 3] as const;

function prettifyStatus(value: string): string {
  if (STATUS_LABEL_LOOKUP[value]) {
    return STATUS_LABEL_LOOKUP[value];
  }

  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
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
  const {
    data: jobTelemetryStats,
    isLoading: telemetryLoading,
    isError: telemetryError,
  } = useJobTelemetryStats();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const totalTrackedJobs = jobTelemetryStats?.totalJobs ?? 0;
  const activeJobs = jobTelemetryStats?.activeJobs ?? 0;
  const mappedJobs = jobTelemetryStats?.mappedJobCount ?? 0;
  const distribution = jobTelemetryStats?.statusDistribution ?? [];
  const telemetryQuoteTotal = jobTelemetryStats?.totalQuoteValue ?? 0;
  const telemetryUnavailable = telemetryError && !telemetryLoading;

  const activeJobsDisplay = telemetryUnavailable
    ? 'Offline'
    : totalTrackedJobs > 0
      ? activeJobs.toLocaleString()
      : '–';
  const activeJobsDescription = telemetryUnavailable
    ? 'Reconnect telemetry'
    : totalTrackedJobs > 0
      ? `of ${totalTrackedJobs.toLocaleString()} tracked`
      : 'Telemetry warming up';

  const telemetryQuoteDisplay = telemetryUnavailable
    ? 'Offline'
    : totalTrackedJobs > 0
      ? formatCurrency(telemetryQuoteTotal)
      : '–';
  const telemetryQuoteDescription = telemetryUnavailable
    ? 'Check Supabase connection'
    : mappedJobs > 0
      ? `${mappedJobs.toLocaleString()} mapped jobs`
      : totalTrackedJobs > 0
        ? `${totalTrackedJobs.toLocaleString()} total jobs`
        : 'Awaiting telemetry';

  return (
    <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex w-full flex-col gap-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.5em] text-slate-200/70">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span>Operations Canvas : Tactical Command</span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl uppercase tracking-[0.28em] text-slate-50 sm:text-5xl">
              {summary.jobName ? summary.jobName : 'New Pavement Mission'}
            </h1>
            <p className="max-w-2xl font-mono text-xs uppercase tracking-[0.45em] text-slate-200/70 sm:text-sm">
              {wallpaper.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StatPill icon={<Gauge className="h-4 w-4" />} label="Total Scope" value={formatArea(summary.totalArea)} />
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

        <div className="grid gap-3 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          <StatPill
            className="min-w-[220px] flex-1"
            icon={<Activity className="h-4 w-4 text-emerald-300" />}
            label="Active Jobs"
            value={activeJobsDisplay}
            description={activeJobsDescription}
            isLoading={telemetryLoading}
          />
          <StatPill
            className="min-w-[220px] flex-1"
            icon={<DollarSign className="h-4 w-4 text-amber-300" />}
            label="Total Quote Value"
            value={telemetryQuoteDisplay}
            description={telemetryQuoteDescription}
            isLoading={telemetryLoading}
          />
          <StatusDistributionCard
            className="min-w-[260px] flex-1"
            distribution={distribution}
            isLoading={telemetryLoading}
            hasError={telemetryUnavailable}
            mappedJobs={mappedJobs}
            totalJobs={totalTrackedJobs}
          />
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
        {isAuthenticated && isAdmin ? (
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
          title={isAuthenticated ? user?.email || undefined : 'Sign in'}
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
  description?: string;
  isLoading?: boolean;
  className?: string;
}

function StatPill({ icon, label, value, description, isLoading = false, className }: StatPillProps) {
  return (
    <span
      className={cn(
        'group relative inline-flex items-center gap-3 overflow-hidden rounded-[var(--hud-radius-md)] border border-white/15 bg-white/5 px-4 py-3',
        'text-left text-sm font-medium text-slate-50/90 shadow-[0_18px_45px_rgba(8,12,24,0.45)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-1',
        className,
      )}
    >
      <span className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12)_10%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100">
        {icon}
      </span>
      <span className="relative flex flex-col leading-tight">
        <span className="text-[0.65rem] uppercase tracking-[0.42em] text-slate-200/70">{label}</span>
        {isLoading ? (
          <Skeleton className="mt-1 h-4 w-16 bg-white/20" />
        ) : (
          <span className="font-mono text-sm text-slate-50">{value}</span>
        )}
        {description ? (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-slate-200/60">{description}</span>
        ) : null}
      </span>
    </span>
  );
}

interface StatusDistributionCardProps {
  className?: string;
  distribution: Array<{ status: string; count: number; percentage: number }>;
  totalJobs: number;
  mappedJobs: number;
  isLoading: boolean;
  hasError: boolean;
}

function StatusDistributionCard({
  className,
  distribution,
  totalJobs,
  mappedJobs,
  isLoading,
  hasError,
}: StatusDistributionCardProps) {
  const baseClassName = cn(
    'group relative flex min-h-[132px] flex-col gap-3 overflow-hidden rounded-[var(--hud-radius-md)] border border-white/15 bg-white/5 p-4',
    'text-left text-sm font-medium text-slate-50/90 shadow-[0_18px_45px_rgba(8,12,24,0.45)] backdrop-blur-lg transition-transform duration-300 hover:-translate-y-1',
    className,
  );

  if (isLoading) {
    return (
      <div className={baseClassName}>
        <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.42em] text-slate-200/50">
          <span>Telemetry Status</span>
          <PieChart className="h-4 w-4 text-slate-200/40" />
        </div>
        <div className="flex flex-col gap-2">
          {STATUS_DISTRIBUTION_SKELETON_ROWS.map((key) => (
            <div key={`status-skeleton-${key}`} className="flex items-center gap-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <Skeleton className="h-3 w-28 bg-white/15" />
              <Skeleton className="h-2 w-full flex-1 bg-white/15" />
              <Skeleton className="h-3 w-8 bg-white/15" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={baseClassName}>
        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.42em] text-rose-200/80">
          <PieChart className="h-4 w-4 text-rose-300" />
          <span>Telemetry Offline</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-100/70">
          Reconnect to Supabase to resume live status updates.
        </p>
      </div>
    );
  }

  if (totalJobs === 0 || distribution.length === 0) {
    return (
      <div className={baseClassName}>
        <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.42em] text-slate-200/70">
          <PieChart className="h-4 w-4 text-slate-200/70" />
          <span>Status Distribution</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-200/60">
          Awaiting telemetry events. Create or update jobs to populate the command map.
        </p>
      </div>
    );
  }

  const sortedDistribution = [...distribution]
    .filter((entry) => entry.count > 0)
    .sort((a, b) => {
      const orderA = STATUS_ORDER.indexOf(a.status);
      const orderB = STATUS_ORDER.indexOf(b.status);
      if (orderA === -1 && orderB === -1) {
        return b.count - a.count;
      }
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    });

  return (
    <div className={baseClassName}>
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] uppercase tracking-[0.42em] text-slate-200/70">Status Distribution</span>
        <span className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.32em] text-slate-200/50">
          <MapPin className="h-3.5 w-3.5" />
          {mappedJobs.toLocaleString()} mapped
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {sortedDistribution.map((entry) => {
          const color = STATUS_COLOR_LOOKUP[entry.status] ?? '#f8fafc';
          const widthPercentage = Number.isFinite(entry.percentage)
            ? Math.min(Math.max(entry.percentage, 4), 100)
            : 0;

          return (
            <div key={entry.status} className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-[120px] items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}55` }}
                />
                <span className="text-[0.65rem] uppercase tracking-[0.32em] text-slate-200/80">
                  {prettifyStatus(entry.status)}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${widthPercentage}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}55` }}
                  />
                </div>
                <span className="font-mono text-sm text-slate-50">{entry.count.toLocaleString()}</span>
                <span className="font-mono text-xs text-slate-200/70">{entry.percentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
