import { createContext, useContext } from 'react';

import type { WorkflowStage, WorkflowStageId } from '../types';

interface WorkflowContextValue {
  stages: WorkflowStage[];
  activeStageId: WorkflowStageId;
  setActiveStage: (stage: WorkflowStageId) => void;
}

export const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export const useWorkflowContext = (): WorkflowContextValue => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error('useWorkflowContext must be used within WorkflowShell.');
  }
  return ctx;
};
