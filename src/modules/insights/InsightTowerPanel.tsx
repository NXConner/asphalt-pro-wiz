import { Printer, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import WeatherCard from '@/components/WeatherCard';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';

interface InsightTowerPanelProps {
  estimator: EstimatorState;
}

export function InsightTowerPanel({ estimator }: InsightTowerPanelProps) {
  const { calculation, job, areas, striping, materials } = estimator;
  const marginPercentage =
    calculation.costs && calculation.costs.total > 0
      ? (calculation.costs.profit / calculation.costs.total) * 100
      : null;

  return (
    <div className="space-y-6">
      <CanvasPanel
        title="Cost Intelligence"
        subtitle="Internal breakdown for leadership huddles and margin protection."
        eyebrow="Executive Tower"
        tone="lagoon"
        action={
          <Button
            type="button"
            variant="outline"
            onClick={calculation.handlePrint}
            disabled={!calculation.showResults}
          >
            <Printer className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        }
      >
        <section className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {calculation.costs ? `$${calculation.costs.total.toFixed(2)}` : 'Awaiting Estimate'}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {areas.total.toFixed(1)} sq ft · {striping.lines} lines · {materials.numCoats} coats
              </p>
            </div>
            {marginPercentage !== null ? (
              <span className="inline-flex items-center rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success-foreground">
                {marginPercentage.toFixed(1)}% projected margin
              </span>
            ) : null}
          </header>
          {calculation.breakdown.length > 0 ? (
            <dl className="grid gap-3">
              {calculation.breakdown.map((item) => (
                <div
                  key={item.item}
                  className="flex items-center justify-between rounded-2xl border border-border/10 bg-card/50 px-4 py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{item.item}</dt>
                  <dd className="font-semibold text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="rounded-2xl border border-dashed border-border/20 bg-card/50 p-6 text-sm text-muted-foreground">
              Run an estimate from the Review step to view your live cost model, including overhead
              and margin recommendations.
            </p>
          )}
        </section>
      </CanvasPanel>

      <CanvasPanel
        title="Field Readiness"
        subtitle="Weather, crew pacing, and atmospheric checks for the scheduled window."
        eyebrow="Conditions"
        tone="aurora"
      >
        <div className="grid gap-6">
          <WeatherCard coords={job.coords} />
          <div className="rounded-2xl border border-border/10 bg-card/50 p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
              <Sparkles className="h-4 w-4" /> Observability Pulse
            </p>
            <ul className="space-y-1 text-muted-foreground">
              {OBSERVABILITY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CanvasPanel>
    </div>
  );
}

const OBSERVABILITY_POINTS = [
  'Structured logging ready for crew events and anomaly alerts.',
  'Automatic capture of weather risk thresholds for Supabase telemetry.',
  'Audit trail tags each estimate with job key and estimator persona.',
];
