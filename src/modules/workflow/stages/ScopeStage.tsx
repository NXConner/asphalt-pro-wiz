import { Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScopeStep } from '@/modules/estimate/components/ScopeStep';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StagePanel } from '../components/StagePanel';

interface ScopeStageProps {
  estimator: EstimatorState;
}

export function ScopeStage({ estimator }: ScopeStageProps) {
  return (
    <StagePanel
      title="Scope Builder"
      eyebrow="Step 03"
      subtitle="Convert condition intel into tangible scopes. Define segments, premium services, and compliance add-ons tailored to church ministries."
      tone="var(--stage-scope)"
      toolbar={
        <Button type="button" variant="outline" className="gap-2" onClick={() => estimator.options.setIncludeStriping(true)}>
          <Compass className="h-4 w-4" />
          Enable striping plan
        </Button>
      }
    >
      <ScopeStep
        areas={estimator.areas}
        options={estimator.options}
        featureFlags={estimator.featureFlags}
        onNext={() => void 0}
      />
    </StagePanel>
  );
}
