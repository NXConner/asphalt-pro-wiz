import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
  CanvasGrid,
  ParticleBackground,
  ProgressRing,
  StatusBar,
  TacticalAlert,
  TacticalCard,
} from '@/components/hud';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isEnabled } from '@/lib/flags';
import { logEvent } from '@/lib/logging';
import { useCommandCenterData } from '@/modules/analytics/useCommandCenterData';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat();
const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const formatStatusLabel = (status: string) =>
  status
    .replace(/_/g, ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export default function CommandCenter() {
  const flagEnabled = isEnabled('commandCenter');
  const { status, metrics, errorMessage } = useCommandCenterData();

  useEffect(() => {
    logEvent('analytics.command_center_route_loaded');
  }, []);

  useEffect(() => {
    if (status === 'ready' && metrics) {
      logEvent('analytics.command_center_loaded', {
        totalRevenue: metrics.totals.totalRevenue,
        totalJobs: metrics.totals.jobs,
      });
    }
  }, [status, metrics]);

  if (!flagEnabled) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-16 text-slate-100">
        <h1 className="text-3xl font-semibold">Executive Command Center</h1>
        <Card className="bg-white/5">
          <CardContent className="space-y-3 py-6 text-slate-200">
            <p>
              This feature is behind the <code>commandCenter</code> flag.
            </p>
            <p>
              Enable it in the settings panel or by setting <code>VITE_FLAG_COMMANDCENTER=1</code>{' '}
              in your environment.
            </p>
            <Button asChild variant="secondary">
              <Link to="/">Return to Operations Canvas</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === 'disabled') {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-16 text-slate-100">
        <h1 className="text-3xl font-semibold">Executive Command Center</h1>
        <Card className="bg-white/5">
          <CardContent className="space-y-3 py-6 text-slate-200">
            <p>{errorMessage}</p>
            <p>Set Supabase credentials to unlock live analytics.</p>
            <Button asChild variant="secondary">
              <Link to="/">Return to Operations Canvas</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-16 text-slate-100">
        <h1 className="text-3xl font-semibold">Executive Command Center</h1>
        <Card className="border-red-500/40 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-100">Unable to load metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-red-100">
            <p>{errorMessage ?? 'Unknown error'}</p>
            <Button
              asChild
              variant="secondary"
              className="bg-white/10 text-slate-50 hover:bg-white/20"
            >
              <Link to="/">Return to Operations Canvas</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === 'loading' || !metrics) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
        <ParticleBackground preset="command" className="opacity-30" />
        <CanvasGrid density={120} className="opacity-10" />
        <p className="relative z-10 text-sm uppercase tracking-[0.3em] text-slate-300">
          Loading analytics…
        </p>
      </main>
    );
  }

  const totalJobs = metrics.totals.jobs || 1;
  const activeRatio = metrics.totals.activeJobs / totalJobs;
  const completionRatio = metrics.totals.completedJobs / totalJobs;
  const lostRatio = metrics.totals.lostJobs / totalJobs;
  const revenueHistory = metrics.revenueByMonth.slice(-6);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <ParticleBackground preset="command" densityMultiplier={1.2} className="opacity-35 mix-blend-screen" />
      <CanvasGrid density={120} className="opacity-10" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-8 lg:px-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-300/70">
            Executive Command Center
          </p>
          <h1 className="font-display text-4xl uppercase tracking-[0.22em] text-slate-50">
            Operations Pulse
          </h1>
          <p className="max-w-3xl text-sm text-slate-200/75">
            Mission telemetry surfaced directly from Supabase. Use this dashboard to triage risk,
            align crews, and spotlight revenue opportunities across church campuses.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <TacticalCard
            eyebrow="Mission Totals"
            heading="Crew Readiness"
            tone="lagoon"
            badge={`${metrics.totals.jobs} jobs`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <StatusBar label="Active" value={metrics.totals.activeJobs} max={totalJobs} />
              <StatusBar label="Completed" value={metrics.totals.completedJobs} max={totalJobs} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricStat label="Active Rate" value={percentFormatter.format(activeRatio)} />
              <MetricStat
                label="Win Rate"
                value={percentFormatter.format(completionRatio)}
                tone="positive"
              />
              <MetricStat
                label="Loss Rate"
                value={percentFormatter.format(lostRatio)}
                tone="warning"
              />
            </div>
          </TacticalCard>

          <TacticalCard
            eyebrow="Revenue"
            heading="Monthly Signal"
            tone="ember"
            badge={currencyFormatter.format(metrics.totals.totalRevenue)}
          >
            <div className="flex flex-wrap items-center gap-6">
              <ProgressRing
                value={metrics.totals.totalRevenue}
                max={Math.max(metrics.totals.totalRevenue, 1)}
                label="Total"
              />
              <div className="flex-1 space-y-2 text-sm text-slate-200/80">
                {revenueHistory.length === 0 ? (
                  <p>No estimates recorded yet.</p>
                ) : (
                  revenueHistory.map((entry) => (
                    <div key={entry.month} className="flex items-center justify-between">
                      <span>{entry.month}</span>
                      <span>{currencyFormatter.format(entry.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TacticalCard>

          <TacticalCard
            eyebrow="Risk Feed"
            heading="Operational Alerts"
            tone="dusk"
            badge={`${metrics.alerts.length} notices`}
            compact
          >
            <div className="space-y-3">
              {metrics.alerts.length === 0 ? (
                <p className="text-sm text-slate-200/70">All systems nominal.</p>
              ) : (
                metrics.alerts.map((alert) => (
                  <TacticalAlert
                    key={alert.id}
                    tone={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}
                    eyebrow={alert.severity.toUpperCase()}
                    headline={alert.message}
                    dense
                  >
                    {alert.detail}
                  </TacticalAlert>
                ))
              )}
            </div>
          </TacticalCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <TacticalCard eyebrow="Recent Missions" heading="Activity Ledger" tone="aurora">
            <div className="space-y-3">
              {metrics.recentJobs.length === 0 ? (
                <p className="text-sm text-slate-200/70">No mission activity recorded yet.</p>
              ) : (
                metrics.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/90"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-50">{job.name ?? job.id}</p>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        {formatStatusLabel(job.status)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{currencyFormatter.format(job.quoteValue)}</p>
                      <p className="text-xs text-slate-400">
                        {dateTimeFormatter.format(Date.parse(job.updatedAt ?? job.createdAt))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TacticalCard>

          <TacticalCard eyebrow="Crew Outlook" heading="Upcoming Assignments" tone="ember">
            <div className="space-y-3">
              {metrics.upcomingAssignments.length === 0 ? (
                <p className="text-sm text-slate-200/70">No assignments scheduled in the next window.</p>
              ) : (
                metrics.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200/90"
                  >
                    <div>
                      <p className="font-semibold text-slate-50">{assignment.jobId}</p>
                      <p className="text-xs text-slate-400">
                        {dayFormatter.format(Date.parse(assignment.shiftStart))}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.35em] text-orange-200/80">
                      {dayFormatter.format(Date.parse(assignment.shiftEnd))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </TacticalCard>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-400">
            Status Breakdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.jobStatusBreakdown.map((entry) => (
              <Card key={entry.status} className="border border-white/10 bg-white/5">
                <CardContent className="space-y-1 py-4">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-300/70">
                    {formatStatusLabel(entry.status)}
                  </p>
                  <p className="text-2xl font-semibold text-slate-50">
                    {numberFormatter.format(entry.count)}
                  </p>
                  <p className="text-xs text-slate-400">{percentFormatter.format(entry.ratio)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="pt-4">
          <Button asChild variant="secondary" className="bg-white/10 text-slate-50 hover:bg-white/20">
            <Link to="/">Return to Operations Canvas</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function MetricStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'warning';
}) {
  const toneClass =
    tone === 'positive' ? 'text-emerald-200' : tone === 'warning' ? 'text-rose-200' : 'text-slate-50';
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300/70">{label}</p>
      <p className={`font-display text-xl ${toneClass}`}>{value}</p>
    </div>
  );
}
