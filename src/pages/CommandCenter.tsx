import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isEnabled } from '@/lib/flags';
import { logEvent } from '@/lib/logging';
import { useCommandCenterData } from '@/modules/analytics/useCommandCenterData';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat();

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
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-16 text-slate-100">
        <h1 className="text-3xl font-semibold">Executive Command Center</h1>
        <p className="text-sm text-slate-300">Loading analytics&hellip;</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-12 text-slate-100">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-200/70">
          Executive Command Center
        </p>
        <h1 className="text-4xl font-semibold">Health Snapshot</h1>
        <p className="max-w-3xl text-sm text-slate-200/80">
          High-level analytics distilled from Supabase data. Use these metrics to steer scheduling,
          monitor revenue, and identify which missions demand attention.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Jobs"
          value={metrics.totals.activeJobs}
          footer="Need estimate / scheduled"
        />
        <MetricCard
          title="Completed"
          value={metrics.totals.completedJobs}
          footer="Closed this cycle"
        />
        <MetricCard
          title="Lost"
          value={metrics.totals.lostJobs}
          footer="Requires debrief"
          tone="warning"
        />
        <MetricCard
          title="Total Quote Value"
          value={currencyFormatter.format(metrics.totals.totalQuoteValue)}
          footer="Across all jobs"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle>Revenue Pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200/80">
            <p className="text-3xl font-semibold text-slate-50">
              {currencyFormatter.format(metrics.totals.totalRevenue)}
            </p>
            <Separator className="bg-white/10" />
            <div className="space-y-2">
              {metrics.revenueByMonth.length === 0 ? (
                <p>No estimates recorded yet.</p>
              ) : (
                metrics.revenueByMonth.map((entry) => (
                  <div key={entry.month} className="flex items-center justify-between">
                    <span>{entry.month}</span>
                    <span>{currencyFormatter.format(entry.total)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5">
          <CardHeader>
            <CardTitle>Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-200/80">
            <div className="flex items-baseline justify-between">
              <span>Average turnaround</span>
              <span className="text-lg font-semibold text-slate-50">
                {metrics.efficiency.averageTurnaroundDays !== null
                  ? `${metrics.efficiency.averageTurnaroundDays} days`
                  : 'Pending'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span>Jobs with crew assigned</span>
              <span className="text-lg font-semibold text-slate-50">
                {metrics.efficiency.scheduledJobs} / {metrics.totals.jobs}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Turnaround measures the median days between job creation and the first estimate. Crew
              coverage tracks how many jobs have an upcoming assignment.
            </p>
          </CardContent>
        </Card>
      </section>

      <div>
        <Button asChild variant="secondary" className="bg-white/10 text-slate-50 hover:bg-white/20">
          <Link to="/">Return to Operations Canvas</Link>
        </Button>
      </div>
    </main>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  footer?: string;
  tone?: 'default' | 'warning';
}

function MetricCard({ title, value, footer, tone = 'default' }: MetricCardProps) {
  const background = tone === 'warning' ? 'bg-amber-900/30 border-amber-400/40' : 'bg-white/5';
  return (
    <Card className={background}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-semibold text-slate-50">
          {typeof value === 'number' ? numberFormatter.format(value) : value}
        </p>
        {footer ? (
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">{footer}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
