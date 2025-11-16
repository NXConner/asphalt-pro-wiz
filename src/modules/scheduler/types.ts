export type MissionTaskStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'blocked';
export type MissionTaskPriority = 'critical' | 'standard' | 'low';
export type MissionAccessibilityImpact =
  | 'entrance'
  | 'parking'
  | 'mobility'
  | 'auditorium'
  | 'walkway'
  | 'none';

export type AccessibilityImpact = MissionAccessibilityImpact;

export interface MissionTask {
  id: string;
  jobId?: string;
  jobName: string;
  site?: string;
  start: string;
  end: string;
  crewRequired: number;
  crewAssignedIds: string[];
  status: MissionTaskStatus;
  priority: MissionTaskPriority;
  accessibilityImpact: AccessibilityImpact;
  notes?: string;
  color?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  color?: string;
  maxHoursPerDay: number;
  availability?: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>;
}

export interface BlackoutWindow {
  id: string;
  title: string;
  reason?: string;
  start: string;
  end: string;
}

export type WorshipBlackoutDraft = Omit<BlackoutWindow, 'id'>;

export interface WorshipImportOptions {
  keywords?: string[];
  timezone?: string;
  defaultReason?: string;
  defaultDurationMinutes?: number;
  bufferMinutes?: {
    before?: number;
    after?: number;
  };
}

export interface WorshipImportResult {
  totalEvents: number;
  created: number;
  updated: number;
  merged: number;
  skipped: number;
  conflicts: WorshipImportConflict[];
}

export interface WorshipImportConflict {
  type: 'task_overlap' | 'blackout_overlap';
  referenceId: string;
  blackoutId: string;
  start: string;
  end: string;
}

export type MissionConflictType =
  | 'crew-overlap'
  | 'time-overlap'
  | 'blackout'
  | 'capacity'
  | 'overtime';

export interface MissionConflict {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: MissionConflictType;
  taskIds: string[];
  description: string;
  window: { start: string; end: string };
}

export interface AccessibilityInsight {
  id: string;
  severity: 'info' | 'warning';
  taskId: string;
  description: string;
  recommendation: string;
}

export interface CapacitySnapshot {
  slot: string;
  crewScheduled: number;
  capacity: number;
}

export interface MissionSuggestion {
  id: string;
  message: string;
  relatedTaskIds: string[];
}
