import { Printer, Sparkles } from "lucide-react";

import WeatherCard from "@/components/WeatherCard";
import { Button } from "@/components/ui/button";
import { CanvasPanel } from "@/modules/layout/CanvasPanel";
import type { EstimatorState } from "@/modules/estimate/useEstimatorState";

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
            className="border-white/20 bg-white/10 text-slate-50 hover:bg-white/20"
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
              <h3 className="text-2xl font-semibold text-slate-50">
                {calculation.costs ? `$${calculation.costs.total.toFixed(2)}` : "Awaiting Estimate"}
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
                {areas.total.toFixed(1)} sq ft · {striping.lines} lines · {materials.numCoats} coats
              </p>
            </div>
            {marginPercentage !== null ? (
              <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {marginPercentage.toFixed(1)}% projected margin
              </span>
            ) : null}
          </header>
          {calculation.breakdown.length > 0 ? (
            <dl className="grid gap-3">
              {calculation.breakdown.map((item) => (
                <div
                  key={item.item}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                >
                  <dt className="text-slate-200/80">{item.item}</dt>
                  <dd className="font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80">
              Run an estimate from the Review step to view your live cost model, including overhead and margin recommendations.
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/80">
            <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-50">
              <Sparkles className="h-4 w-4" /> Observability Pulse
            </h3>
            <ul className="space-y-1">
              {OBSERVABILITY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
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
  "Structured logging ready for crew events and anomaly alerts.",
  "Automatic capture of weather risk thresholds for Supabase telemetry.",
  "Audit trail tags each estimate with job key and estimator persona.",
];
