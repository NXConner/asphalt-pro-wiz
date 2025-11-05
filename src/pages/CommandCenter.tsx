import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { CanvasGrid, ParticleBackground, ProgressRing, StatusBar } from '@/components/hud';
import {
  DivisionCard,
  DivisionCardBadge,
  DivisionCardDivider,
  DivisionCardHeader,
  DivisionCardList,
  DivisionCardMetric,
} from '@/components/division';
import { Button } from '@/components/ui/button';
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
  const alertListItems = metrics.alerts.map((alert) => ({
    id: alert.id,
    headline: alert.message,
    subline: alert.detail,
    meta: alert.severity.toUpperCase(),
    tone:
      alert.severity === 'critical'
        ? 'critical'
        : alert.severity === 'warning'
          ? 'warning'
          : 'neutral',
  }));
  const recentJobItems = metrics.recentJobs.map((job) => ({
    id: job.id,
    headline: job.name ?? job.id,
    subline: `${formatStatusLabel(job.status)} • ${currencyFormatter.format(job.quoteValue)}`,
    meta: dateTimeFormatter.format(Date.parse(job.updatedAt ?? job.createdAt)),
    tone: job.status === 'active' ? 'positive' : job.status === 'lost' ? 'critical' : 'neutral',
  }));
  const assignmentItems = metrics.upcomingAssignments.map((assignment) => ({
    id: assignment.id,
    headline: assignment.jobId,
    subline: dayFormatter.format(Date.parse(assignment.shiftStart)),
    meta: dayFormatter.format(Date.parse(assignment.shiftEnd)),
    tone: 'warning',
  }));

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <ParticleBackground
        preset="command"
        densityMultiplier={1.2}
        className="opacity-35 mix-blend-screen"
      />
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
          <DivisionCard variant="command">
            <DivisionCardHeader
              eyebrow="Mission Totals"
              title="Crew Readiness"
              subtitle="Live job allocation across active crews"
              badge={<DivisionCardBadge>{metrics.totals.jobs} Jobs</DivisionCardBadge>}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusBar label="Active" value={metrics.totals.activeJobs} max={totalJobs} />
              <StatusBar label="Completed" value={metrics.totals.completedJobs} max={totalJobs} />
            </div>
            <DivisionCardDivider />
            <div className="grid gap-3 sm:grid-cols-3">
              <DivisionCardMetric
                label="Active Rate"
                value={percentFormatter.format(activeRatio)}
                tone="neutral"
              />
              <DivisionCardMetric
                label="Win Rate"
                value={percentFormatter.format(completionRatio)}
                tone="positive"
              />
              <DivisionCardMetric
                label="Loss Rate"
                value={percentFormatter.format(lostRatio)}
                tone="critical"
              />
            </div>
          </DivisionCard>

          <DivisionCard variant="intel">
            <DivisionCardHeader
              eyebrow="Revenue"
              title="Monthly Signal"
              subtitle="Six month trailing revenue cadence"
              badge={
                <DivisionCardBadge>
                  {currencyFormatter.format(metrics.totals.totalRevenue)}
                </DivisionCardBadge>
              }
            />
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
          </DivisionCard>

          <DivisionCard variant="alert">
            <DivisionCardHeader
              eyebrow="Risk Feed"
              title="Operational Alerts"
              subtitle="Auto surfaced blockers requiring attention"
              badge={<DivisionCardBadge>{metrics.alerts.length} Notices</DivisionCardBadge>}
            />
            {alertListItems.length === 0 ? (
              <p className="hud-mono text-sm text-slate-200/75">All systems nominal.</p>
            ) : (
              <DivisionCardList items={alertListItems} />
            )}
          </DivisionCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <DivisionCard>
            <DivisionCardHeader
              eyebrow="Recent Missions"
              title="Activity Ledger"
              subtitle="Latest job outcomes across the portfolio"
            />
            {recentJobItems.length === 0 ? (
              <p className="hud-mono text-sm text-slate-200/70">
                No mission activity recorded yet.
              </p>
            ) : (
              <DivisionCardList items={recentJobItems} />
            )}
          </DivisionCard>

          <DivisionCard variant="intel" subdued>
            <DivisionCardHeader
              eyebrow="Crew Outlook"
              title="Upcoming Assignments"
              subtitle="Next wave of scheduled deployment windows"
            />
            {assignmentItems.length === 0 ? (
              <p className="hud-mono text-sm text-slate-200/70">
                No assignments scheduled in the next window.
              </p>
            ) : (
              <DivisionCardList items={assignmentItems} />
            )}
          </DivisionCard>
        </section>

        <section className="space-y-3">
          <DivisionCard>
            <DivisionCardHeader
              eyebrow="Status Breakdown"
              title="Pipeline Composition"
              subtitle="Current portfolio distribution by job state"
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.jobStatusBreakdown.map((entry) => (
                <DivisionCardMetric
                  key={entry.status}
                  label={formatStatusLabel(entry.status)}
                  value={numberFormatter.format(entry.count)}
                  delta={percentFormatter.format(entry.ratio)}
                  tone={
                    entry.status === 'completed'
                      ? 'positive'
                      : entry.status === 'lost'
                        ? 'critical'
                        : 'neutral'
                  }
                />
              ))}
            </div>
          </DivisionCard>
        </section>

        <div className="pt-4">
          <Button
            asChild
            variant="secondary"
            className="bg-white/10 text-slate-50 hover:bg-white/20"
          >
            <Link to="/">Return to Operations Canvas</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
