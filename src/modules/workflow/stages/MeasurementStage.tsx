import { useMemo, useState } from 'react';
import { Camera, Cpu, MapPin, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { MeasurementIntelState } from '@/hooks/useMeasurementIntel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { cn } from '@/lib/utils';

import { StageMetric } from '../components/StageMetric';
import { StagePanel } from '../components/StagePanel';
import { useWorkflowTelemetry, type WorkflowMeasurementRun } from '../hooks/useWorkflowTelemetry';

interface MeasurementStageProps {
  estimator: EstimatorState;
  intel: MeasurementIntelState;
}

export function MeasurementStage({ estimator, intel }: MeasurementStageProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mapViewport, setMapViewport] = useState({ lat: 36.777, lng: -76.334, zoom: 19 });
  const fallbackRuns = useMemo<WorkflowMeasurementRun[]>(() => {
    if (!intel.measurement) return [];
    return [
      {
        id: 'local-measurement',
        strategy: 'session',
        status: 'ready',
        squareFeet: intel.measurement.squareFeet,
        crackLinearFeet: intel.measurement.cracks.linearFeet,
        confidence: intel.measurement.confidence,
        createdAt: new Date().toISOString(),
        segments: intel.measurement.segments?.map((segment, idx) => ({
          id: `local-${segment.id ?? idx}`,
          label: segment.label,
          squareFeet: segment.squareFeet,
        })),
      },
    ];
  }, [intel.measurement]);
  const telemetry = useWorkflowTelemetry(estimator.job.id ?? null, fallbackRuns);

  const metrics = useMemo(
    () => [
      {
        label: 'Known Sq Ft',
        value: `${estimator.areas.total.toLocaleString()} ft²`,
        delta: intel.measurement?.squareFeet ? `${intel.measurement.squareFeet.toLocaleString()} AI` : undefined,
        tone: intel.measurement ? 'positive' : 'neutral',
        hint: intel.measurement?.confidence ? `${Math.round(intel.measurement.confidence * 100)}% confidence` : undefined,
      },
      {
        label: 'Crack Footage',
        value: `${estimator.cracks.length.toLocaleString()} lf`,
        delta: intel.measurement?.cracks ? `${intel.measurement.cracks.linearFeet.toLocaleString()} AI` : undefined,
        tone: intel.measurement ? 'positive' : 'neutral',
      },
      {
        label: 'Measurement Mode',
        value: intel.status === 'ready' ? 'AI Assisted' : 'Manual / Map',
        tone: intel.status === 'ready' ? 'positive' : 'neutral',
      },
    ],
    [estimator.areas.total, estimator.cracks.length, intel.measurement, intel.status],
  );

  const handleManualAreaCommit = () => {
    if (!estimator.areas.manualInput) return;
    estimator.areas.addManual();
    toast({ title: 'Manual area added', description: `${estimator.areas.manualInput} ft² committed.` });
  };

  const runAuto = async (strategy: 'image' | 'map' | 'drone') => {
    await intel.runAutoMeasurement({
      strategy,
      imageUrl: strategy === 'image' ? imageUrl : undefined,
      mapViewport: strategy === 'map' ? mapViewport : undefined,
      droneMissionId: strategy === 'drone' ? estimator.job.name : undefined,
    });
  };

  return (
    <StagePanel
      title="Measure & Map"
      eyebrow="Step 01"
      subtitle="Start every mission with reliable square-footage and crack footage. Mix AI outputs with field inputs and keep a versioned log."
      tone="var(--stage-measure)"
      toolbar={
        <Button type="button" size="sm" variant="outline" onClick={() => intel.reset()}>
          Reset intel
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StageMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            tone={metric.tone as any}
            hint={metric.hint}
          />
        ))}
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="image">AI from imagery</TabsTrigger>
          <TabsTrigger value="map">Map / drone</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm text-white/70">Square Feet</Label>
              <div className="mt-2 flex gap-3">
                <Input
                  value={estimator.areas.manualInput}
                  onChange={(event) => estimator.areas.setManualInput(event.target.value)}
                  placeholder="e.g. 42,875"
                />
                <Button type="button" onClick={handleManualAreaCommit}>
                  Commit
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm text-white/70">Crack Footage</Label>
              <div className="mt-2 flex gap-3">
                <Input
                  value={estimator.cracks.length}
                  type="number"
                  min={0}
                  onChange={(event) => estimator.cracks.setLength(Number(event.target.value))}
                />
                <Button type="button" variant="secondary" onClick={() => estimator.cracks.setLength(0)}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm text-white/70">Field notes</Label>
            <Textarea
              className="mt-2 min-h-[120px]"
              placeholder="Crew notes, obstructions, photos, etc."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </TabsContent>
        <TabsContent value="image" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm text-white/70">Hosted Image URL</Label>
              <Input
                placeholder="https://.../drone-stitch.webp"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
            </div>
            <div className="flex items-end justify-end gap-3">
              <Button
                type="button"
                className="gap-2"
                disabled={!imageUrl || intel.status === 'loading'}
                onClick={() => runAuto('image')}
              >
                <Camera className="h-4 w-4" />
                Run AI
              </Button>
            </div>
          </div>
          <IntelStatus status={intel.status} error={intel.error} />
        </TabsContent>
        <TabsContent value="map" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm text-white/70">Latitude</Label>
              <Input
                type="number"
                value={mapViewport.lat}
                onChange={(event) => setMapViewport((prev) => ({ ...prev, lat: Number(event.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-sm text-white/70">Longitude</Label>
              <Input
                type="number"
                value={mapViewport.lng}
                onChange={(event) => setMapViewport((prev) => ({ ...prev, lng: Number(event.target.value) }))}
              />
            </div>
            <div>
              <Label className="text-sm text-white/70">Zoom</Label>
              <Input
                type="number"
                value={mapViewport.zoom}
                onChange={(event) => setMapViewport((prev) => ({ ...prev, zoom: Number(event.target.value) }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="gap-2" onClick={() => runAuto('map')} disabled={intel.status === 'loading'}>
              <MapPin className="h-4 w-4" />
              Auto trace map
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={() => runAuto('drone')}>
              <Cpu className="h-4 w-4" />
              Sync drone intel
            </Button>
          </div>
          <IntelStatus status={intel.status} error={intel.error} />
          {intel.drone?.hazards ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-semibold text-white">Drone findings</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                {intel.drone.hazards.map((hazard) => (
                  <li key={hazard.id}>{hazard.description}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Measurement history</p>
            <p className="text-xs text-white/60">
              {telemetry.isRemoteSourceActive ? 'Synced from Supabase' : 'Local session snapshot'}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={telemetry.refresh} disabled={telemetry.isLoading}>
            <RefreshCcw className={cn('h-4 w-4', telemetry.isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
        {telemetry.error ? (
          <p className="mt-2 text-xs text-rose-300">{telemetry.error}</p>
        ) : null}
        {telemetry.measurementRuns.length ? (
          <ul className="mt-4 space-y-3">
            {telemetry.measurementRuns.map((run) => (
              <li key={run.id ?? `${run.strategy}-${run.createdAt ?? Math.random()}`} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{run.strategy}</p>
                    <p className="text-xs text-white/60">
                      {run.squareFeet ? `${Math.round(run.squareFeet).toLocaleString()} ft²` : 'Pending area'}
                    </p>
                  </div>
                  <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">{run.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/60">
                  {typeof run.confidence === 'number' ? (
                    <span>Confidence {Math.round(run.confidence * 100)}%</span>
                  ) : null}
                  {typeof run.crackLinearFeet === 'number' ? (
                    <span>{Math.round(run.crackLinearFeet).toLocaleString()} lf cracks</span>
                  ) : null}
                  <span>{run.segments?.length ?? 0} segments</span>
                  {run.createdAt ? <span>{new Date(run.createdAt).toLocaleString()}</span> : null}
                </div>
                {run.notes ? <p className="mt-2 text-xs text-white/60">{run.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-white/60">Run an auto measurement to seed history.</p>
        )}
      </div>
    </StagePanel>
  );
}

interface IntelStatusProps {
  status: MeasurementIntelState['status'];
  error?: string;
}

function IntelStatus({ status, error }: IntelStatusProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
        status === 'ready'
          ? 'border-emerald-400/40 text-emerald-200'
          : status === 'loading'
            ? 'border-white/20 text-white/70'
            : error
              ? 'border-rose-400/40 text-rose-200'
              : 'border-white/20 text-white/60',
      )}
    >
      <RefreshCcw className={cn('h-3.5 w-3.5', status === 'loading' && 'animate-spin')} />
      {error ? error : status === 'ready' ? 'AI measurement synced' : status === 'loading' ? 'Processing imagery...' : 'Idle'}
    </div>
  );
}
