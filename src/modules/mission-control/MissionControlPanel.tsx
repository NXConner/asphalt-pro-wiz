import { Building2, MapPin, Ruler, Waypoints } from 'lucide-react';
import { lazy, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { JobStatus } from '@/lib/idb';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';
import { DivisionMapInterface } from '@/modules/mission-control/division-map/DivisionMapInterface';

const MapComponent = lazy(() => import('@/components/Map'));

const JOB_STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'need_estimate', label: 'Needs Estimate' },
  { value: 'estimated', label: 'Estimated' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'lost', label: 'Lost' },
];

interface MissionControlPanelProps {
  estimator: EstimatorState;
}

export function MissionControlPanel({ estimator }: MissionControlPanelProps) {
  const { job, areas, cracks } = estimator;

  return (
    <CanvasPanel
      title="Mission Control"
      subtitle="Map intelligence, travel logistics, and status telemetry for your next sealcoat mission."
      eyebrow="Field Intel"
      tone="aurora"
      action={
        <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-100/80">
          {job.distance > 0 ? `${job.distance.toFixed(1)} mi RT to site` : 'Awaiting location'}
        </span>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <fieldset>
              <Label
                htmlFor="jobName"
                className="text-xs uppercase tracking-wide text-slate-200/70"
              >
                Job Name
              </Label>
              <Input
                id="jobName"
                value={job.name}
                placeholder="St. Mark Sanctuary"
                onChange={(event) => job.setName(event.target.value)}
                className="mt-1 bg-secondary/80 text-base text-secondary-foreground placeholder:text-muted-foreground/60"
              />
            </fieldset>
            <fieldset>
              <Label
                htmlFor="jobAddress"
                className="text-xs uppercase tracking-wide text-slate-200/70"
              >
                Site Address (optional manual override)
              </Label>
              <Input
                id="jobAddress"
                value={job.address}
                placeholder="Search or type address"
                onChange={(event) => job.setAddress(event.target.value)}
                className="mt-1 bg-secondary/80 text-base text-secondary-foreground placeholder:text-muted-foreground/60"
              />
            </fieldset>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <fieldset>
              <Label
                htmlFor="jobStatus"
                className="text-xs uppercase tracking-wide text-slate-200/70"
              >
                Job Status
              </Label>
              <Select value={job.status} onValueChange={(value: JobStatus) => job.setStatus(value)}>
                <SelectTrigger
                  id="jobStatus"
                  className="mt-1 h-10 bg-secondary/80 text-secondary-foreground"
                  aria-label="Select job status"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </fieldset>
            <fieldset>
              <Label
                htmlFor="competitor"
                className="text-xs uppercase tracking-wide text-slate-200/70"
              >
                Competitor Intel
              </Label>
              <Input
                id="competitor"
                value={job.competitor}
                placeholder="Optional"
                onChange={(event) => job.setCompetitor(event.target.value)}
                className="mt-1 bg-secondary/80 text-base text-secondary-foreground placeholder:text-muted-foreground/60"
              />
            </fieldset>
            <fieldset>
              <Label
                htmlFor="refreshButton"
                className="text-xs uppercase tracking-wide text-slate-200/70"
              >
                Refresh Field Data
              </Label>
              <Button
                id="refreshButton"
                type="button"
                variant="secondary"
                className="mt-1 h-10"
                onClick={() =>
                  job.handleAddressUpdate(job.coords ?? job.businessCoords, job.address)
                }
                disabled={!job.coords && !job.address}
                aria-label="Sync to latest field data"
              >
                Sync To Latest
              </Button>
            </fieldset>
          </div>
        </div>
        <aside className="grid gap-3">
          <DataStat
            icon={<Building2 className="h-4 w-4" />}
            label="Business Home Base"
            value={job.businessAddress}
            sub={`${job.businessCoords[0].toFixed(3)}, ${job.businessCoords[1].toFixed(3)}`}
          />
          <DataStat
            icon={<Waypoints className="h-4 w-4" />}
            label="Supplier Round Trip"
            value={`${job.supplierDistance.toFixed(1)} mi`}
            sub={job.supplierAddress}
          />
          <DataStat
            icon={<Ruler className="h-4 w-4" />}
            label="Mapped Area"
            value={areas.total > 0 ? `${areas.total.toFixed(1)} sq ft` : 'Awaiting capture'}
            sub={`${areas.items.length} segments tracked`}
          />
        </aside>
      </section>
      <Suspense
        fallback={
          <Skeleton className="h-[420px] w-full rounded-3xl border border-white/10 bg-white/10" />
        }
      >
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
          <MapComponent
            customerAddress={job.address}
            onAddressUpdate={job.handleAddressUpdate}
            onAreaDrawn={areas.handleAreaDrawn}
            onCrackLengthDrawn={cracks.handleCrackLengthDrawn}
            refreshKey={job.mapRefreshKey}
          />
        </div>
      </Suspense>
      <DivisionMapInterface />
      <footer className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <InfoChip icon={<MapPin className="h-4 w-4" />} label="Site Coordinates">
          {job.coords
            ? `${job.coords[0].toFixed(5)}, ${job.coords[1].toFixed(5)}`
            : 'Not captured yet'}
        </InfoChip>
        <InfoChip icon={<Waypoints className="h-4 w-4" />} label="Round Trip Distance">
          {job.distance > 0 ? `${job.distance.toFixed(1)} mi` : 'Pending address'}
        </InfoChip>
        <InfoChip icon={<Ruler className="h-4 w-4" />} label="Segments">
          {areas.items.length} recorded | {areas.total.toFixed(1)} sq ft
        </InfoChip>
      </footer>
    </CanvasPanel>
  );
}

interface DataStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function DataStat({ icon, label, value, sub }: DataStatProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
      <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-slate-50">
        {icon}
      </span>
      <div className="space-y-1 text-sm">
        <p className="text-xs uppercase tracking-widest text-slate-200/70">{label}</p>
        <p className="font-semibold text-slate-50">{value}</p>
        {sub ? <p className="text-xs text-slate-200/70">{sub}</p> : null}
      </div>
    </div>
  );
}

interface InfoChipProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function InfoChip({ icon, label, children }: InfoChipProps) {
  return (
    <span className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-slate-100 shadow backdrop-blur">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-slate-100">
        {icon}
      </span>
      <span className="flex flex-col text-left">
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-200/60">{label}</span>
        <span className="text-sm font-medium text-slate-50">{children}</span>
      </span>
    </span>
  );
}
