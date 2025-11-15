import { memo, useMemo } from 'react';

import { TacticalCard } from '@/components/hud/TacticalCard';
import { TacticalMap, type TacticalHazard, type TacticalWaypoint, type TacticalZone } from '@/components/map/TacticalMap';
import { TacticalButton } from '@/components/ui/tactical-button';
import { isEnabled } from '@/lib/flags';
import { logEvent } from '@/lib/logging';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

const noop = () => {};

interface MissionMapIntelProps {
  estimator: EstimatorState;
}

export const MissionMapIntel = memo(function MissionMapIntel({ estimator }: MissionMapIntelProps) {
  const mapEnabled = isEnabled('tacticalMapV2');
  const { job, areas, cracks, logistics } = estimator;
  const baseCoords = job.coords ?? job.businessCoords;

  const waypoints = useMemo<TacticalWaypoint[]>(() => {
    const points: TacticalWaypoint[] = [
      {
        id: 'ops-hq',
        coordinates: job.businessCoords,
        label: 'Ops HQ',
        status: 'active',
      },
      {
        id: 'supply-node',
        coordinates: job.supplierCoords,
        label: 'Supplier',
        status: 'pending',
        color: '#22d3ee',
      },
    ];

    if (job.coords) {
      points.unshift({
        id: 'mission-site',
        coordinates: job.coords,
        label: job.name || 'Mission Site',
        status: job.status === 'completed' ? 'hold' : job.status === 'active' ? 'active' : 'pending',
        color: job.status === 'active' ? '#f97316' : undefined,
      });
    }

    return points;
  }, [job.coords, job.name, job.status, job.businessCoords, job.supplierCoords]);

  const hazards = useMemo<TacticalHazard[]>(() => {
    const [lat, lng] = baseCoords;
    const hazardList: TacticalHazard[] = [];
    if (cracks.length > 0) {
      const severity = cracks.length > 600 ? 'high' : cracks.length > 300 ? 'medium' : 'low';
      hazardList.push({
        id: 'crack-density',
        coordinates: [lat + 0.0006, lng - 0.0004],
        severity,
        label: 'Crack Density',
      });
    }
    if (logistics.oilSpots > 0) {
      hazardList.push({
        id: 'oil-spots',
        coordinates: [lat - 0.00045, lng + 0.00035],
        severity: logistics.oilSpots > 6 ? 'high' : 'medium',
        label: 'Oil Spots',
      });
    }
    if (logistics.propaneTanks > 0) {
      hazardList.push({
        id: 'propane-tanks',
        coordinates: [lat + 0.0003, lng + 0.0005],
        severity: 'medium',
        label: 'Propane Storage',
      });
    }
    return hazardList;
  }, [baseCoords, cracks.length, logistics.oilSpots, logistics.propaneTanks]);

  const zones = useMemo<TacticalZone[]>(() => {
    const [lat, lng] = baseCoords;
    const delta = Math.min(0.02, Math.max(0.0012, Math.sqrt(Math.max(areas.total, 1000)) / 90000));
    return [
      {
        id: 'mission-footprint',
        label: 'Mission Footprint',
        color: 'rgba(252,176,64,0.4)',
        points: [
          [lat + delta, lng - delta],
          [lat + delta, lng + delta],
          [lat - delta, lng + delta],
          [lat - delta, lng - delta],
        ],
      },
    ];
  }, [areas.total, baseCoords]);

  if (!mapEnabled) {
    return null;
  }

  const hazardCount = hazards.length;
  const crewMiles = job.distance > 0 ? `${job.distance.toFixed(1)} mi RT` : 'Awaiting location';
  const waypointCount = waypoints.length;

  const handlePulse = (action: string) => {
    try {
      logEvent(`mission.intel.${action}`, {
        hazardCount,
        waypointCount,
        jobId: job.name || 'mission',
      });
    } catch {}
  };

  return (
    <TacticalCard
      accent="lagoon"
      heading="Mission Intel Overlay"
      subtitle="Waypoints, hazard rings, and crew readiness pulses"
      compact
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/80">
            <p className="text-[0.65rem] text-white/60">Crew Distance</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{crewMiles}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/80">
            <p className="text-[0.65rem] text-white/60">Waypoints</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{waypointCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/80">
            <p className="text-[0.65rem] text-white/60">Hazards</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{hazardCount}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <TacticalButton glow leadingIcon="☄" onClick={() => handlePulse('pulse')}>
            Pulse Intel
          </TacticalButton>
          <TacticalButton
            leadingIcon="🛰"
            variant="ghost"
            onClick={() => handlePulse('sync')}
          >
            Sync Waypoints
          </TacticalButton>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <TacticalMap
            className="h-[360px]"
            waypoints={waypoints}
            hazards={hazards}
            zones={zones}
            mapHeight={360}
            onWaypointSelect={(waypoint) => handlePulse(`select.${waypoint.id}`)}
            onAddressUpdate={noop}
            onAreaDrawn={noop}
            onCrackLengthDrawn={noop}
            customerAddress={job.address}
            showPulse
            center={baseCoords}
            zoom={15}
          />
        </div>
      </div>
    </TacticalCard>
  );
});
