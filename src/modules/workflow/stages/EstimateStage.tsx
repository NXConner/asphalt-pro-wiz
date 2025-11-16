import { Loader2, PiggyBank, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MaterialsStep } from '@/modules/estimate/components/MaterialsStep';
import { ReviewStep } from '@/modules/estimate/components/ReviewStep';
import { StripingStep } from '@/modules/estimate/components/StripingStep';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StageMetric } from '../components/StageMetric';
import { StagePanel } from '../components/StagePanel';

interface EstimateStageProps {
  estimator: EstimatorState;
}

export function EstimateStage({ estimator }: EstimateStageProps) {
  const costs = estimator.calculation.costs;

  return (
    <StagePanel
      title="Estimate Fusion"
      eyebrow="Step 04"
      subtitle="Blend supplier telemetry, compliance guardrails, and AI scenario guidance to converge on a confident proposal."
      tone="var(--stage-estimate)"
      toolbar={
        <Button
          type="button"
          className="gap-2"
          disabled={estimator.calculation.isSaving}
          onClick={() => estimator.calculation.handleCalculate()}
        >
          {estimator.calculation.isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          Recalculate
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StageMetric
          label="Projected total"
          value={costs?.total ? `$${Math.round(costs.total).toLocaleString()}` : 'Pending'}
          tone={costs?.profit && costs.profit > 0 ? 'positive' : 'warning'}
          hint="Includes material, labor, premium services."
        />
        <StageMetric
          label="Gross margin"
          value={costs?.profit ? `${Math.round((costs.profit / (costs.total || 1)) * 100)}%` : 'Pending'}
          tone={costs?.profit && costs.profit > 0 ? 'positive' : 'negative'}
          hint={costs?.profit ? `$${Math.round(costs.profit).toLocaleString()} net` : undefined}
        />
        <StageMetric
          label="Scenario status"
          value={estimator.featureFlags.isEnabled('aiAssistant') ? 'AI co-pilot ready' : 'Manual'}
          icon={<PiggyBank className="h-4 w-4" />}
          hint="Modify supplier telemetry in Business → Settings."
        />
      </div>

      <div className="grid gap-6">
        <MaterialsStep
          materials={estimator.materials}
          options={estimator.options}
          cracks={estimator.cracks}
          logistics={estimator.logistics}
          job={estimator.job}
          featureFlags={estimator.featureFlags}
          onNext={() => void 0}
          onBack={() => void 0}
        />
        <StripingStep
          striping={estimator.striping}
          premium={estimator.premium}
          onNext={() => void 0}
          onBack={() => void 0}
        />
        <ReviewStep
          areas={estimator.areas}
          striping={estimator.striping}
          materials={estimator.materials}
          customServices={estimator.customServices}
          calculation={estimator.calculation}
          cracks={estimator.cracks}
          options={estimator.options}
          premium={estimator.premium}
          logistics={estimator.logistics}
          business={estimator.business}
          job={estimator.job}
          onBack={() => void 0}
          featureFlags={estimator.featureFlags}
        />
      </div>
    </StagePanel>
  );
}
