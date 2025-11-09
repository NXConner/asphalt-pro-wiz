import { logEvent } from '@/lib/logging';

import { getFeatureFlagDefinition, type FeatureFlag } from '@/lib/featureFlags/definitions';
import { getFlagSnapshot } from '@/lib/featureFlags/state';

type FeatureFlagToggleSource =
  | 'local'
  | 'remote-sync'
  | 'seed'
  | 'bootstrap'
  | 'migration'
  | 'api';

const TELEMETRY_NAMESPACE = 'feature_flags';

function toToggleEvent(flag: FeatureFlag): string {
  const definition = getFeatureFlagDefinition(flag);
  return `${TELEMETRY_NAMESPACE}.${definition.telemetryKey}.toggled`;
}

export function logFeatureFlagToggle(
  flag: FeatureFlag,
  enabled: boolean,
  options: {
    source?: FeatureFlagToggleSource;
    actorId?: string | null;
    surface?: string;
    metadata?: Record<string, unknown>;
  } = {},
): void {
  const definition = getFeatureFlagDefinition(flag);
  const event = toToggleEvent(flag);
  const surfaces = definition.surfaces ?? [];

  logEvent(event, {
    flag,
    enabled,
    source: options.source ?? 'local',
    actorId: options.actorId ?? null,
    surface: options.surface ?? null,
    category: definition.category,
    telemetryKey: definition.telemetryKey,
    supabaseKey: definition.supabaseKey,
    tags: definition.tags ?? [],
    surfaces,
    ...options.metadata,
  });
}

export function logFeatureFlagSync(
  phase: 'started' | 'success' | 'failed',
  metadata?: Record<string, unknown>,
): void {
  const level = phase === 'failed' ? 'error' : 'info';
  const event = `${TELEMETRY_NAMESPACE}.remote_sync.${phase}`;
  logEvent(event, metadata, level);
}

export function logFeatureFlagAuditSnapshot(metadata?: Record<string, unknown>): void {
  const snapshot = getFlagSnapshot();
  logEvent(
    `${TELEMETRY_NAMESPACE}.audit.snapshot`,
    {
      flags: snapshot,
      ...metadata,
    },
    'info',
  );
}

export function logFeatureFlagRemoteOverrideApplied(
  overrides: Partial<Record<FeatureFlag, boolean>>,
  metadata?: Record<string, unknown>,
): void {
  logEvent(
    `${TELEMETRY_NAMESPACE}.remote_override.applied`,
    {
      overrides,
      ...metadata,
    },
  );
}
