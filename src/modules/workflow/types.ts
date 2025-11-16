import type { ReactNode } from 'react';

import type { WorkflowThemeId } from '@/design/system';

export type WorkflowStageId =
  | 'measure'
  | 'condition'
  | 'scope'
  | 'estimate'
  | 'outreach'
  | 'contract'
  | 'schedule'
  | 'closeout';

export type WorkflowStageStatus = 'locked' | 'todo' | 'active' | 'done' | 'blocked' | 'review';

export interface WorkflowStageMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: 'positive' | 'negative' | 'neutral' | 'warning';
  hint?: string;
}

export interface WorkflowStageAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
}

export interface WorkflowStage {
  id: WorkflowStageId;
  title: string;
  eyebrow: string;
  summary: string;
  status: WorkflowStageStatus;
  etaMinutes?: number;
  badges?: string[];
  metrics?: WorkflowStageMetric[];
  actions?: WorkflowStageAction[];
  panel: ReactNode;
  inspector?: ReactNode;
}

export interface WorkflowMissionMeta {
  jobName: string;
  campus: string;
  contact: string;
  phaseLabel: string;
  totalArea: number;
  crackFootage: number;
  status: string;
  lastUpdatedIso: string;
}

export interface WorkflowShellProps {
  stages: WorkflowStage[];
  activeStageId: WorkflowStageId;
  onStageChange: (stageId: WorkflowStageId) => void;
  wallpaper?: {
    name: string;
    description?: string;
    source?: string;
  };
  onNextWallpaper?: () => void;
  onUploadWallpaper?: (file: File) => void;
  uploadingWallpaper?: boolean;
  toolbarSlot?: ReactNode;
  hudOverlay?: ReactNode;
  missionMeta: WorkflowMissionMeta;
  workflowThemeId?: WorkflowThemeId;
  jobId?: string | null;
}
