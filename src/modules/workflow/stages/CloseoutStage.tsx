import { ClipboardCheck, Star, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ReceiptsPanel } from '@/components/ReceiptsPanel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StagePanel } from '../components/StagePanel';

interface CloseoutStageProps {
  estimator: EstimatorState;
}

export function CloseoutStage({ estimator }: CloseoutStageProps) {
  return (
    <StagePanel
      title="Closeout & Insights"
      eyebrow="Step 08"
      subtitle="Finalize QA checklists, punch items, customer satisfaction surveys, and feed analytics dashboards for continuous improvement."
      tone="var(--stage-closeout)"
      toolbar={
        <Button type="button" className="gap-2">
          <Trophy className="h-4 w-4" />
          Archive mission
        </Button>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">QA Checklist</p>
            <p className="text-xs text-white/60">Capture punch-list evidence with annotated photos.</p>
          </div>
          <Button type="button" variant="secondary" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Mark complete
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">Satisfaction snapshot</p>
        <div className="mt-3 flex items-center gap-2 text-lg text-white">
          <Star className="h-5 w-5 text-amber-300" />
          4.9 / 5.0 expected
        </div>
        <p className="text-xs text-white/60">Auto-send survey to contacts after invoice payment.</p>
      </div>
      <ReceiptsPanel estimator={estimator} />
    </StagePanel>
  );
}
