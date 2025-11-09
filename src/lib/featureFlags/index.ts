export type {
  FeatureFlag,
  FeatureFlagDefinition,
  FeatureFlagCategory,
} from '@/lib/featureFlags/definitions';

export {
  FEATURE_FLAG_DEFINITIONS,
  FEATURE_FLAGS,
  DEFAULT_FLAGS,
  FEATURE_FLAG_LOOKUP,
  getFeatureFlagDefinition,
  isKnownFeatureFlag,
  listFeatureFlagDefinitions,
} from '@/lib/featureFlags/definitions';

export {
  FEATURE_FLAG_STORAGE_KEY,
  clearRemoteFlags,
  getFlagSnapshot,
  getFlags,
  getRemoteOverrides,
  isEnabled,
  listDefaultFlags,
  listFeatureFlags,
  setFlag,
  setFlags,
  setRemoteFlags,
} from '@/lib/featureFlags/state';

export {
  logFeatureFlagAuditSnapshot,
  logFeatureFlagRemoteOverrideApplied,
  logFeatureFlagSync,
  logFeatureFlagToggle,
} from '@/lib/featureFlags/telemetry';
