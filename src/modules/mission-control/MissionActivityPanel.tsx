import { useMemo, useState } from 'react';

import { useMissionActivity } from './useMissionActivity';

import { TacticalCard } from '@/components/hud/TacticalCard';
import { TacticalMap } from '@/components/map/TacticalMap';
import { Button } from '@/components/ui/button';
import { isEnabled } from '@/lib/flags';
import { logEvent } from '@/lib/logging';

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-emerald-300',
  in_progress: 'text-cyan-300',
  scheduled: 'text-orange-300',
  on_hold: 'text-amber-300',
  cancelled: 'text-rose-300',
  pending: 'text-slate-200',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(timestamp: string): string {
  try {
    const diff = Date.now() - Date.parse(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'moments ago';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'recently';
  }
}

const noop = () => {};

export function MissionActivityPanel() {
  const enhancementsEnabled = isEnabled('tacticalMapV2');
  const { timeline, hazards, waypoints, isLoading, isError, stats } = useMissionActivity();
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const selectedMission = useMemo(() => {
    if (!selectedMissionId) return null;
    return timeline.find((entry) => entry.id === selectedMissionId) ?? null;
  }, [selectedMissionId, timeline]);

  const handleSelectMission = (missionId: string) => {
    setSelectedMissionId(missionId);
    logEvent('mission_activity_select', { missionId });
  };

  if (!enhancementsEnabled) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <TacticalCard
        accent="aurora"
        heading="Mission Timeline"
        subtitle="Telemetry feed from Supabase job_telemetry table"
        compact
      >
        {isLoading ? (
          <p className="text-sm text-slate-200/70">Synchronizing mission activity…</p>
        ) : isError ? (
          <p className="text-sm text-rose-300">Unable to load mission telemetry.</p>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-slate-200/70">No telemetry recorded yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {timeline.map((entry) => {
              const label = STATUS_LABELS[entry.status] ?? entry.status;
              const tone = STATUS_COLORS[entry.status] ?? 'text-slate-200';
              const isActive = selectedMissionId === entry.id;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectMission(entry.id)}
                    className={
                      'w-full rounded-lg px-3 py-3 text-left transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300'
                    }
                    data-active={isActive}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-xs font-semibold uppercase tracking-[0.35em] ${tone}`}>
                        {label}
                      </span>
                      <span className="text-xs text-slate-300/70">
                        {formatRelativeTime(entry.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-100/85">{entry.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300/70">
                      <span>{formatCurrency(entry.quote)}</span>
                      {entry.location?.address ? <span>{entry.location.address}</span> : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {stats?.lastEventAt ? (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-300/70">
            <span>Live feed online</span>
            <span>Last update {formatRelativeTime(stats.lastEventAt)}</span>
          </div>
        ) : null}
      </TacticalCard>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300/70">
              Mission Map
            </p>
            <h2 className="font-display text-2xl uppercase tracking-[0.24em] text-slate-50">
              Tactical Overlay
            </h2>
          </div>
          <Button
            variant="ghost"
            size="compact"
            className="text-xs uppercase tracking-[0.35em] text-slate-300/70"
            onClick={() => logEvent('mission_activity_refresh_map')}
          >
            Refresh Map
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(8,12,24,0.55)]">
          <TacticalMap
            className="h-[420px]"
            hazards={hazards}
            waypoints={waypoints}
            onWaypointSelect={(waypoint) => handleSelectMission(waypoint.id)}
            showPulse
            mapHeight={420}
            onAddressUpdate={noop}
            onAreaDrawn={noop}
            onCrackLengthDrawn={noop}
            customerAddress={selectedMission?.location?.address ?? ''}
          />
        </div>

        {selectedMission ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-[0.35em] text-slate-200">
                {STATUS_LABELS[selectedMission.status] ?? selectedMission.status}
              </span>
              <span>{formatRelativeTime(selectedMission.updatedAt)}</span>
            </div>
            <p className="mt-2 text-slate-100">{selectedMission.name}</p>
            {selectedMission.location?.address ? (
              <p className="mt-1 text-xs text-slate-300/70">{selectedMission.location.address}</p>
            ) : null}
            <p className="mt-3 text-sm text-slate-200">
              Authorized quote: {formatCurrency(selectedMission.quote)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
