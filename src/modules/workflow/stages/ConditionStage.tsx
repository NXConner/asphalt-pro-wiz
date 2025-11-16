import { AlertTriangle, Droplets, Flame, Thermometer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { MeasurementIntelState } from '@/hooks/useMeasurementIntel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StageMetric } from '../components/StageMetric';
import { StagePanel } from '../components/StagePanel';

interface ConditionStageProps {
  estimator: EstimatorState;
  intel: MeasurementIntelState;
}

const severityPalette = ['#a3e635', '#fbbf24', '#f97316', '#f43f5e'];

export function ConditionStage({ estimator, intel }: ConditionStageProps) {
  const severity = intel.measurement?.cracks ?? {
    linearFeet: estimator.cracks.length,
    severityScore: Math.min(estimator.cracks.length / 2000, 1),
    distribution: { hairline: estimator.cracks.length * 0.6, structural: estimator.cracks.length * 0.4 },
  };

  const segments = intel.measurement?.segments ?? estimator.areas.items.map((item, idx) => ({
    id: `segment-${item.id}`,
    label: `Segment ${idx + 1}`,
    squareFeet: item.area,
  }));

  return (
    <StagePanel
      title="Condition Intelligence"
      eyebrow="Step 02"
      subtitle="Blend AI severity modeling with crew insights. Prioritize crack cleaning, patching, and ADA audits before scoping treatments."
      tone="var(--stage-condition)"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StageMetric
          label="Severity score"
          value={`${Math.round(severity.severityScore * 100)} / 100`}
          tone={severity.severityScore > 0.65 ? 'negative' : severity.severityScore > 0.4 ? 'warning' : 'positive'}
          hint="AI-generated severity index"
        />
        <StageMetric
          label="Segments tracked"
          value={segments.length.toString()}
          tone="neutral"
          hint="Manual + AI traced segments"
        />
        <StageMetric
          label="Moisture risk"
          value={estimator.logistics.oilSpots > 5 ? 'High' : estimator.logistics.oilSpots > 1 ? 'Moderate' : 'Low'}
          tone={estimator.logistics.oilSpots > 5 ? 'negative' : 'positive'}
          hint={`${estimator.logistics.oilSpots} contaminated zones reported`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-semibold text-white">Segment health</p>
          <div className="mt-4 space-y-3">
            {segments.map((segment, index) => {
              const percent = estimator.areas.total
                ? Math.round((segment.squareFeet / estimator.areas.total) * 100)
                : 0;
              return (
                <div key={segment.id}>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{segment.label}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        background: severityPalette[index % severityPalette.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-semibold text-white">Alerts</p>
          <div className="mt-3 space-y-3 text-sm text-white/75">
            <Alert
              icon={<AlertTriangle className="h-4 w-4" />}
              label="ADA stencil refresh overdue"
              detail="Last repaint 28 months ago."
            />
            <Alert icon={<Droplets className="h-4 w-4" />} label="Oil soak zones" detail="6 hot-spots flagged for priming." />
            {severity.severityScore > 0.7 ? (
              <Alert icon={<Flame className="h-4 w-4" />} label="Structural cracks" detail="Recommend routing before seal." tone="negative" />
            ) : null}
            {intel.drone?.thermal ? (
              <Alert
                icon={<Thermometer className="h-4 w-4" />}
                label="Thermal variance"
                detail={`Δ ${intel.drone.thermal.pavementDeltaF} °F indicates moisture pockets.`}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">Recommended actions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-amber-400/40 text-amber-200">
            Pre-sweep & blow
          </Badge>
          <Badge variant="outline" className="border-emerald-400/40 text-emerald-200">
            Routing & hot pour
          </Badge>
          <Badge variant="outline" className="border-sky-400/40 text-sky-200">
            ADA stencil plan
          </Badge>
          <Badge variant="outline" className="border-rose-400/40 text-rose-200">
            Moisture mitigation
          </Badge>
        </div>
      </div>
    </StagePanel>
  );
}

interface AlertProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
  tone?: 'default' | 'negative';
}

function Alert({ icon, label, detail, tone = 'default' }: AlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 p-3">
      <div className={tone === 'negative' ? 'text-rose-300' : 'text-white/70'}>{icon}</div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-white/60">{detail}</p>
      </div>
    </div>
  );
}
