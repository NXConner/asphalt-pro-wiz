import { PhoneCall, Send, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EngagementHubPanel } from '@/modules/engagement/EngagementHubPanel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { StagePanel } from '../components/StagePanel';

interface OutreachStageProps {
  estimator: EstimatorState;
  onOpenCompliance: () => void;
}

export function OutreachStage({ estimator, onOpenCompliance }: OutreachStageProps) {
  return (
    <StagePanel
      title="Outreach & Approvals"
      eyebrow="Step 05"
      subtitle="Sequence pastoral approvals, board briefings, and congregation updates with templated multi-channel communications."
      tone="var(--stage-outreach)"
      toolbar={
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={onOpenCompliance}>
            <Users className="h-4 w-4" />
            Compliance brief
          </Button>
          <Button type="button" className="gap-2">
            <Send className="h-4 w-4" />
            Send update
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Primary contact</p>
            <p className="text-xs text-white/60">{estimator.job.address || 'Pending site address'}</p>
          </div>
          <Button type="button" variant="secondary" className="gap-2">
            <PhoneCall className="h-4 w-4" />
            Call facility director
          </Button>
        </div>
      </div>
      <EngagementHubPanel estimator={estimator} />
    </StagePanel>
  );
}
