import { type ReactNode, useMemo } from 'react';

import type { MeasurementIntelState } from '@/hooks/useMeasurementIntel';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';

import { WORKFLOW_STAGE_COLORS } from '@/design/system';
import { STAGE_DESCRIPTIONS, STAGE_EYEBROWS, STAGE_LABELS, WORKFLOW_STAGE_ORDER } from './constants';
import type { WorkflowStage, WorkflowStageId } from './types';
import { MeasurementStage } from './stages/MeasurementStage';
import { ConditionStage } from './stages/ConditionStage';
import { ScopeStage } from './stages/ScopeStage';
import { EstimateStage } from './stages/EstimateStage';
import { OutreachStage } from './stages/OutreachStage';
import { ContractStage } from './stages/ContractStage';
import { ScheduleStage } from './stages/ScheduleStage';
import { CloseoutStage } from './stages/CloseoutStage';

interface UseWorkflowStagesParams {
  estimator: EstimatorState;
  measurement: MeasurementIntelState;
  missionControl: ReactNode;
  onOpenCompliance: () => void;
}

export function useWorkflowStages({
  estimator,
  measurement,
  missionControl,
  onOpenCompliance,
}: UseWorkflowStagesParams): WorkflowStage[] {
  return useMemo<WorkflowStage[]>(() => {
    const statuses = computeStatuses(estimator, measurement);

    return WORKFLOW_STAGE_ORDER.map((stageId) => ({
      id: stageId,
      title: STAGE_LABELS[stageId],
      eyebrow: STAGE_EYEBROWS[stageId],
      summary: STAGE_DESCRIPTIONS[stageId],
      status: statuses[stageId],
      panel: renderPanel(stageId, estimator, measurement, missionControl, onOpenCompliance),
      badges: [],
    }));
  }, [estimator, measurement, missionControl, onOpenCompliance]);
}

type StageStatusMap = Record<WorkflowStageId, WorkflowStage['status']>;

const renderPanel = (
  stageId: WorkflowStageId,
  estimator: EstimatorState,
  measurement: MeasurementIntelState,
  missionControl: ReactNode,
  onOpenCompliance: () => void,
) => {
  switch (stageId) {
    case 'measure':
      return <MeasurementStage estimator={estimator} intel={measurement} />;
    case 'condition':
      return <ConditionStage estimator={estimator} intel={measurement} />;
    case 'scope':
      return <ScopeStage estimator={estimator} />;
    case 'estimate':
      return <EstimateStage estimator={estimator} />;
    case 'outreach':
      return <OutreachStage estimator={estimator} onOpenCompliance={onOpenCompliance} />;
    case 'contract':
      return <ContractStage estimator={estimator} />;
    case 'schedule':
      return <ScheduleStage estimator={estimator} missionControl={missionControl} />;
    case 'closeout':
      return <CloseoutStage estimator={estimator} />;
    default:
      return null;
  }
};

const computeStatuses = (estimator: EstimatorState, measurement: MeasurementIntelState): StageStatusMap => {
  const map: StageStatusMap = {
    measure: measurement.measurement ? 'done' : 'active',
    condition: measurement.measurement ? 'active' : 'locked',
    scope: estimator.areas.total > 0 ? 'active' : 'locked',
    estimate: estimator.calculation.costs ? 'todo' : 'locked',
    outreach: 'todo',
    contract: estimator.calculation.costs ? 'todo' : 'locked',
    schedule: 'todo',
    closeout: 'locked',
  };
  if (estimator.calculation.costs) {
    map.estimate = 'done';
    map.contract = 'active';
  }
  if (estimator.job.status === 'active') {
    map.schedule = 'active';
  }
  if (estimator.job.status === 'completed') {
    map.closeout = 'review';
  }
  return map;
};

export const stageColorFor = (id: WorkflowStageId) => WORKFLOW_STAGE_COLORS[id];
