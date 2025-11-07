export type MissionTaskStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'blocked';

export type MissionTaskPriority = 'critical' | 'standard' | 'low';

export type AccessibilityImpact =
  | 'entrance'
  | 'parking'
  | 'mobility'
  | 'auditorium'
  | 'walkway'
  | 'none';

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
  skipped: number;
}
