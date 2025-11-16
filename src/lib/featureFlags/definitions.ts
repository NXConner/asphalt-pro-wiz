type FeatureFlagDefinitionBase = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly category: FeatureFlagCategory;
  readonly defaultValue: boolean;
  readonly envVar: string;
  readonly supabaseKey: string;
  readonly telemetryKey: string;
  readonly tags?: readonly string[];
  readonly surfaces?: readonly string[];
};

const FEATURE_FLAG_DEFINITIONS_RAW = [
  {
    id: 'imageAreaAnalyzer',
    label: 'AI Image Area Analyzer',
    description:
      'Leverage aerial imagery and computer vision to auto-measure paved surfaces, feed scope calculations, and cross-check manual takeoffs.',
    category: 'estimator',
    defaultValue: true,
    envVar: 'VITE_FLAG_IMAGEAREAANALYZER',
    supabaseKey: 'imageAreaAnalyzer',
    telemetryKey: 'image_area_analyzer',
    tags: ['ai', 'estimation', 'geospatial'],
    surfaces: ['EstimatorStudio', 'OperationsCanvas'],
  },
  {
    id: 'aiAssistant',
    label: 'AI Operations Copilot',
    description:
      'Unlock conversational copilot workflows for estimation, mission planning, compliance prep, and executive briefings.',
    category: 'estimator',
    defaultValue: true,
    envVar: 'VITE_FLAG_AIASSISTANT',
    supabaseKey: 'aiAssistant',
    telemetryKey: 'ai_assistant',
    tags: ['ai', 'productivity'],
    surfaces: ['EstimatorStudio', 'MissionScheduler', 'CommandCenter'],
  },
  {
    id: 'pwa',
    label: 'Progressive Web App Shell',
    description:
      'Enable the offline-capable PWA shell, install prompts, and background sync queue tailored for field crews.',
    category: 'mobile',
    defaultValue: true,
    envVar: 'VITE_FLAG_PWA',
    supabaseKey: 'pwa',
    telemetryKey: 'pwa',
    tags: ['offline', 'mobile'],
    surfaces: ['MobileShell', 'FieldOps'],
  },
  {
    id: 'i18n',
    label: 'Internationalization Toolkit',
    description:
      'Expose translation scaffolding, locale switching, and date/number formatting for multilingual congregations.',
    category: 'ui',
    defaultValue: true,
    envVar: 'VITE_FLAG_I18N',
    supabaseKey: 'i18n',
    telemetryKey: 'i18n',
    tags: ['localization'],
    surfaces: ['UIFramework', 'CommandCenter'],
  },
  {
    id: 'receipts',
    label: 'Digital Receipts & Proposals',
    description:
      'Generate branded proposal PDFs, digital receipts, and send summaries to pastors after site walks.',
    category: 'operations',
    defaultValue: true,
    envVar: 'VITE_FLAG_RECEIPTS',
    supabaseKey: 'receipts',
    telemetryKey: 'receipts',
    tags: ['documentation', 'finance'],
    surfaces: ['EstimatorStudio', 'EngagementHub'],
  },
  {
    id: 'ownerMode',
    label: 'Owner Mode Perspective',
    description:
      'Switch estimator into owner/operator mode for small business budgeting, crew payroll, and profitability guardrails.',
    category: 'operations',
    defaultValue: false,
    envVar: 'VITE_FLAG_OWNERMODE',
    supabaseKey: 'ownerMode',
    telemetryKey: 'owner_mode',
    tags: ['administration'],
    surfaces: ['EstimatorStudio'],
  },
  {
    id: 'scheduler',
    label: 'Mission Scheduler',
    description:
      'Activate worship-aware scheduling, crew capacity management, blackout import/export, and conflict detection.',
    category: 'scheduler',
    defaultValue: false,
    envVar: 'VITE_FLAG_SCHEDULER',
    supabaseKey: 'scheduler',
    telemetryKey: 'mission_scheduler',
    tags: ['scheduling', 'calendar'],
    surfaces: ['MissionScheduler'],
  },
  {
    id: 'schedulerConstraintSolver',
    label: 'Scheduler Constraint Solver',
    description:
      'Enable the advanced constraint engine that analyzes crew load, rest windows, and blackout proximity to surface higher-fidelity conflicts and recommendations.',
    category: 'scheduler',
    defaultValue: false,
    envVar: 'VITE_FLAG_SCHEDULER_CONSTRAINTS',
    supabaseKey: 'schedulerConstraintSolver',
    telemetryKey: 'scheduler_constraint_solver',
    tags: ['scheduling', 'optimization'],
    surfaces: ['MissionScheduler'],
  },
  {
    id: 'schedulerIcsAutomation',
    label: 'Worship ICS Automation',
    description:
      'Allows importing and exporting worship blackout calendars (ICS) with structured logging, buffering, and deduplication safeguards.',
    category: 'scheduler',
    defaultValue: true,
    envVar: 'VITE_FLAG_SCHEDULER_ICS',
    supabaseKey: 'schedulerIcsAutomation',
    telemetryKey: 'scheduler_ics_automation',
    tags: ['calendar', 'integrations'],
    surfaces: ['MissionScheduler'],
  },
  {
    id: 'optimizer',
    label: 'Scenario Optimizer',
    description:
      'Run scenario optimizations that factor crew load, material logistics, weather, and worship constraints.',
    category: 'estimator',
    defaultValue: false,
    envVar: 'VITE_FLAG_OPTIMIZER',
    supabaseKey: 'optimizer',
    telemetryKey: 'optimizer',
    tags: ['optimization'],
    surfaces: ['EstimatorStudio'],
  },
  {
    id: 'customerPortal',
    label: 'Pastor Engagement Portal',
    description:
      'Provide pastors and facility directors with a secure portal for approvals, progress tracking, and blackout coordination.',
    category: 'operations',
    defaultValue: false,
    envVar: 'VITE_FLAG_CUSTOMERPORTAL',
    supabaseKey: 'customerPortal',
    telemetryKey: 'customer_portal',
    tags: ['collaboration'],
    surfaces: ['Portal'],
  },
  {
    id: 'observability',
    label: 'Observability & Telemetry',
    description:
      'Stream structured logs, metrics, and incident telemetry to Supabase and external APMs for proactive monitoring.',
    category: 'observability',
    defaultValue: true,
    envVar: 'VITE_FLAG_OBSERVABILITY',
    supabaseKey: 'observability',
    telemetryKey: 'observability',
    tags: ['monitoring'],
    surfaces: ['MonitoringCore', 'CommandCenter'],
  },
  {
    id: 'commandCenter',
    label: 'Executive Command Center',
    description:
      'Expose the tactical HUD dashboards, revenue telemetry, mission activity feeds, and Lovable preview incident console.',
    category: 'command_center',
    defaultValue: true,
    envVar: 'VITE_FLAG_COMMANDCENTER',
    supabaseKey: 'commandCenter',
    telemetryKey: 'command_center',
    tags: ['analytics', 'executive'],
    surfaces: ['CommandCenter'],
  },
  {
    id: 'tacticalMapV2',
    label: 'Tactical Map Overlays v2',
    description:
      'Unlock mission-grade overlays, GIS hazard zoning, AR drone corridors, and live crew positioning in the tactical map.',
    category: 'ui',
    defaultValue: true,
    envVar: 'VITE_FLAG_TACTICALMAPV2',
    supabaseKey: 'tacticalMapV2',
    telemetryKey: 'tactical_map_v2',
    tags: ['mapping', 'gis'],
    surfaces: ['CommandCenter', 'MissionControl'],
  },
] as const satisfies ReadonlyArray<FeatureFlagDefinitionBase>;

export type FeatureFlag = (typeof FEATURE_FLAG_DEFINITIONS_RAW)[number]['id'];

export type FeatureFlagCategory =
  | 'estimator'
  | 'scheduler'
  | 'observability'
  | 'command_center'
  | 'ui'
  | 'mobile'
  | 'operations';

export type FeatureFlagDefinition = (typeof FEATURE_FLAG_DEFINITIONS_RAW)[number] & {
  id: FeatureFlag;
};

export const FEATURE_FLAG_DEFINITIONS: ReadonlyArray<FeatureFlagDefinition> =
  FEATURE_FLAG_DEFINITIONS_RAW;

export const FEATURE_FLAGS = FEATURE_FLAG_DEFINITIONS.map(
  (definition) => definition.id,
) as readonly FeatureFlag[];

export const DEFAULT_FLAGS: Readonly<Record<FeatureFlag, boolean>> =
  FEATURE_FLAG_DEFINITIONS.reduce(
    (acc, definition) => {
      acc[definition.id] = definition.defaultValue;
      return acc;
    },
    {} as Record<FeatureFlag, boolean>,
  );

export const FEATURE_FLAG_LOOKUP = new Map<FeatureFlag, FeatureFlagDefinition>(
  FEATURE_FLAG_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function isKnownFeatureFlag(value: string | null | undefined): value is FeatureFlag {
  if (!value) return false;
  return FEATURE_FLAG_LOOKUP.has(value as FeatureFlag);
}

export function getFeatureFlagDefinition(flag: FeatureFlag): FeatureFlagDefinition {
  const definition = FEATURE_FLAG_LOOKUP.get(flag);
  if (!definition) {
    throw new Error(`Unknown feature flag "${flag}"`);
  }
  return definition;
}

export function listFeatureFlagDefinitions(): ReadonlyArray<FeatureFlagDefinition> {
  return FEATURE_FLAG_DEFINITIONS;
}
