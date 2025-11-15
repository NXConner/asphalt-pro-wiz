import { Printer, Sparkles, Radio } from 'lucide-react';
import { memo, useMemo } from 'react';

import { StatusBar } from '@/components/hud';
import { Button } from '@/components/ui/button';
import WeatherCard from '@/components/WeatherCard';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { CanvasPanel } from '@/modules/layout/CanvasPanel';

interface InsightTowerPanelProps {
  estimator: EstimatorState;
}

export const InsightTowerPanel = memo(function InsightTowerPanel({
  estimator,
}: InsightTowerPanelProps) {
  const { calculation, job, areas, striping, materials } = estimator;
  const marginPercentage =
    calculation.costs && calculation.costs.total > 0
      ? (calculation.costs.profit / calculation.costs.total) * 100
      : null;

  const marginStatus = useMemo(() => {
    if (marginPercentage === null) return 'neutral';
    if (marginPercentage >= 20) return 'ok';
    if (marginPercentage >= 10) return 'warn';
    return 'critical';
  }, [marginPercentage]);

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
                {calculation.costs ? `$${calculation.costs.total.toFixed(2)}` : 'Awaiting Estimate'}
              </h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-200/60">
                {areas.total.toFixed(1)} sq ft · {striping.lines} lines · {materials.numCoats} coats
              </p>
            </div>
            {marginPercentage !== null ? (
              <div className="flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100 shadow-[0_0_12px_rgba(34,211,153,0.3)]">
                  <Radio className="h-3 w-3 animate-pulse text-emerald-300" />
                  {marginPercentage.toFixed(1)}% projected margin
                </span>
                <StatusBar
                  value={marginPercentage}
                  max={30}
                  criticalThreshold={10}
                  warningThreshold={15}
                  label="Margin Health"
                  className="w-32"
                />
              </div>
            ) : null}
          </header>
          {calculation.breakdown.length > 0 ? (
            <dl className="grid gap-3">
              {calculation.breakdown.map((item, index) => (
                <div
                  key={item.item}
                  className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition-all duration-300 hover:border-orange-400/30 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(251,146,60,0.2)]"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span
                    className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.08)_10%,transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <dt className="relative font-mono text-xs uppercase tracking-wider text-slate-200/80">
                    {item.item}
                  </dt>
                  <dd className="relative font-mono font-semibold text-slate-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-sm text-slate-200/80">
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
});

const OBSERVABILITY_POINTS = [
  'Structured logging ready for crew events and anomaly alerts.',
  'Automatic capture of weather risk thresholds for Supabase telemetry.',
  'Audit trail tags each estimate with job key and estimator persona.',
];
