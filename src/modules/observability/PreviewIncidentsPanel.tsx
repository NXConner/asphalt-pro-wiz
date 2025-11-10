import { AlertOctagon, RefreshCcw, ShieldAlert } from 'lucide-react';

import {
  DivisionCard,
  DivisionCardBadge,
  DivisionCardHeader,
  DivisionCardList,
  DivisionCardMetric,
} from '@/components/division';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { PreviewAssetIncidentsResult } from '@/hooks/usePreviewAssetIncidents';
import { cn } from '@/lib/utils';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';

interface PreviewIncidentsPanelProps {
  data?: PreviewAssetIncidentsResult;
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
}

function renderStatusBadge(data?: PreviewAssetIncidentsResult) {
  if (!data) {
    return <DivisionCardBadge>Initializing</DivisionCardBadge>;
  }

  if (data.hasActiveAlert) {
    return (
      <span className="hud-mono inline-flex items-center gap-2 rounded-full border border-rose-400/50 bg-rose-500/10 px-3 py-1 text-[0.7rem] text-rose-200">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-300 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
        Active incidents
      </span>
    );
  }

  return <DivisionCardBadge>Stable</DivisionCardBadge>;
}

function formatRelative(iso?: string | null): string {
  if (!iso) return 'No signals yet';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'No signals yet';
  return formatRelativeTime(parsed);
}

function formatSeverityMeta(severity: string): string {
  return severity.toUpperCase();
}

const SEVERITY_TONE_MAP = {
  info: 'neutral',
  warning: 'warning',
  error: 'critical',
  critical: 'critical',
} as const;

export function PreviewIncidentsPanel({
  data,
  isLoading,
  isError,
  onRefresh,
}: PreviewIncidentsPanelProps) {
  const incidents = data?.incidents ?? [];
  const stats = data?.stats;

  const topIncidents = incidents.slice(0, 6).map((incident) => {
    const headline = incident.asset_url ?? incident.page_url ?? incident.event_type;
    const subline = incident.reason ?? incident.message ?? 'No message captured';
    return {
      id: incident.id,
      headline,
      subline,
      meta: formatSeverityMeta(incident.severity),
      tone: SEVERITY_TONE_MAP[incident.severity] ?? 'critical',
    };
  });

  return (
    <DivisionCard variant={data?.hasActiveAlert ? 'alert' : 'intel'}>
      <DivisionCardHeader
        eyebrow="Lovable Preview"
        title="Preview Asset Health"
        subtitle="Monitors Lovable.dev preview bundles for load and promise failures."
        badge={renderStatusBadge(data)}
        actions={
          <Button
            type="button"
            variant="ghost"
            className="hud-mono inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
            onClick={onRefresh}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl bg-white/10" />
          <Skeleton className="h-24 rounded-2xl bg-white/10" />
          <Skeleton className="h-24 rounded-2xl bg-white/10" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <DivisionCardMetric
            label="Incidents (24h)"
            value={formatNumber(stats?.lastDay ?? 0)}
            tone={(stats?.lastDay ?? 0) > 0 ? 'warning' : 'neutral'}
            delta={stats?.lastHour ? `${formatNumber(stats.lastHour)} in last hour` : undefined}
          />
          <DivisionCardMetric
            label="Most Recent"
            value={formatRelative(stats?.mostRecentOccurredAt)}
            tone={data?.hasActiveAlert ? 'critical' : 'neutral'}
            delta={
              stats?.affectedAssets
                ? `${formatNumber(stats.affectedAssets)} assets flagged`
                : 'All assets nominal'
            }
          />
          <DivisionCardMetric
            label="Critical Signals"
            value={formatNumber(stats?.severityCounts?.critical ?? 0)}
            tone={(stats?.severityCounts?.critical ?? 0) > 0 ? 'critical' : 'neutral'}
            delta={
              stats && stats.severityCounts.error
                ? `${formatNumber(stats.severityCounts.error)} error-level`
                : undefined
            }
          />
        </div>
      )}

      {isError ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200/90">
          <AlertOctagon className="h-4 w-4" />
          Unable to load Lovable preview incidents. Check Supabase observability tables.
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div
          className={cn(
            'space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4',
            data?.hasActiveAlert ? 'border-rose-400/40 bg-rose-500/10' : '',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="hud-eyebrow inline-flex items-center gap-2 text-[0.58rem] text-slate-200/70">
              <ShieldAlert className="h-4 w-4" />
              Latest incidents
            </span>
            <span className="hud-mono text-xs text-slate-300/70">
              {incidents.length > 0
                ? `Showing ${Math.min(incidents.length, 6)} of ${incidents.length}`
                : 'No incidents recorded'}
            </span>
          </div>
          {incidents.length === 0 ? (
            <p className="hud-body text-sm text-slate-200/70">
              No Lovable preview regressions detected in the current window. Asset loading is
              healthy.
            </p>
          ) : (
            <DivisionCardList items={topIncidents} />
          )}
        </div>
      ) : null}
    </DivisionCard>
  );
}
