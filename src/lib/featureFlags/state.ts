import {
  DEFAULT_FLAGS,
  FEATURE_FLAG_DEFINITIONS,
  getFeatureFlagDefinition,
  isKnownFeatureFlag,
  type FeatureFlag,
} from '@/lib/featureFlags/definitions';

export const FEATURE_FLAG_STORAGE_KEY = 'pps:flags';

let remoteOverrides: Partial<Record<FeatureFlag, boolean>> = {};

type BooleanLike = string | number | boolean | null | undefined;

function normalizeBoolean(value: BooleanLike): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined;
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) return false;
    return undefined;
  }
  return undefined;
}

function readRuntimeEnv(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, unknown> })?.env) {
      Object.assign(result, (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {});
    }
  } catch {
    // ignore access errors
  }
  try {
    if (typeof process !== 'undefined' && (process as { env?: Record<string, unknown> }).env) {
      Object.assign(result, (process as { env?: Record<string, unknown> }).env ?? {});
    }
  } catch {
    // ignore access errors
  }
  return result;
}

function resolveEnvironmentOverride(flag: FeatureFlag): boolean | undefined {
  const definition = getFeatureFlagDefinition(flag);
  const env = readRuntimeEnv();
  const fallbackKeys = [
    definition.envVar,
    definition.envVar.replace(/^VITE_/, ''),
    `FLAG_${definition.supabaseKey.toUpperCase()}`,
    `PPS_FLAG_${definition.supabaseKey.toUpperCase()}`,
  ];

  for (const key of fallbackKeys) {
    if (!key) continue;
    const raw = env[key];
    const normalized = normalizeBoolean(raw as BooleanLike);
    if (typeof normalized === 'boolean') {
      return normalized;
    }
  }

  return undefined;
}

function readLocalOverrides(): Partial<Record<FeatureFlag, boolean>> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(FEATURE_FLAG_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
    const overrides: Partial<Record<FeatureFlag, boolean>> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!isKnownFeatureFlag(key)) continue;
      const normalized = normalizeBoolean(value as BooleanLike);
      if (typeof normalized !== 'boolean') continue;
      if (normalized === DEFAULT_FLAGS[key]) continue;
      overrides[key] = normalized;
    }
    return overrides;
  } catch {
    return {};
  }
}

function writeLocalOverrides(overrides: Partial<Record<FeatureFlag, boolean>>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const payload: Partial<Record<FeatureFlag, boolean>> = {};
    for (const [key, value] of Object.entries(overrides)) {
      if (!isKnownFeatureFlag(key)) continue;
      if (typeof value !== 'boolean') continue;
      if (value === DEFAULT_FLAGS[key]) continue;
      payload[key] = value;
    }

    if (Object.keys(payload).length === 0) {
      localStorage.removeItem(FEATURE_FLAG_STORAGE_KEY);
    } else {
      localStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // ignore persistence errors
  }
}

function readLocalFlags(): Record<FeatureFlag, boolean> {
  const overrides = readLocalOverrides();
  return { ...DEFAULT_FLAGS, ...overrides };
}

function dispatchFlagUpdate(): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pps:flags:update'));
    }
  } catch {
    // ignore dispatch errors
  }
}

export function getFlags(): Record<FeatureFlag, boolean> {
  const local = readLocalFlags();
  return { ...local, ...remoteOverrides };
}

export function getFlagSnapshot(): Readonly<Record<FeatureFlag, boolean>> {
  return Object.freeze({ ...getFlags() });
}

export function isEnabled(flag: FeatureFlag): boolean {
  const remoteValue = remoteOverrides[flag];
  if (typeof remoteValue === 'boolean') {
    return remoteValue;
  }

  const overrides = readLocalOverrides();
  if (flag in overrides && typeof overrides[flag] === 'boolean') {
    return overrides[flag] as boolean;
  }

  const envOverride = resolveEnvironmentOverride(flag);
  if (typeof envOverride === 'boolean') {
    return envOverride;
  }

  return DEFAULT_FLAGS[flag];
}

export function setFlag(flag: FeatureFlag, enabled: boolean): void {
  const overrides = readLocalOverrides();
  if (enabled === DEFAULT_FLAGS[flag]) {
    delete overrides[flag];
  } else {
    overrides[flag] = enabled;
  }
  writeLocalOverrides(overrides);
  dispatchFlagUpdate();
}

export function setFlags(flags: Partial<Record<FeatureFlag, boolean>>): void {
  const overrides = readLocalOverrides();
  let dirty = false;

  for (const [flag, value] of Object.entries(flags)) {
    if (!isKnownFeatureFlag(flag)) continue;
    if (typeof value !== 'boolean') continue;
    if (value === DEFAULT_FLAGS[flag]) {
      if (flag in overrides) {
        delete overrides[flag];
        dirty = true;
      }
      continue;
    }
    if (overrides[flag] === value) continue;
    overrides[flag] = value;
    dirty = true;
  }

  if (dirty) {
    writeLocalOverrides(overrides);
    dispatchFlagUpdate();
  }
}

export function setRemoteFlags(overrides: Partial<Record<FeatureFlag, boolean>>): void {
  const filtered: Partial<Record<FeatureFlag, boolean>> = {};
  for (const [flag, value] of Object.entries(overrides)) {
    if (!isKnownFeatureFlag(flag)) continue;
    if (typeof value !== 'boolean') continue;
    filtered[flag] = value;
  }
  remoteOverrides = filtered;
  dispatchFlagUpdate();
}

export function clearRemoteFlags(): void {
  if (Object.keys(remoteOverrides).length === 0) return;
  remoteOverrides = {};
  dispatchFlagUpdate();
}

export function getRemoteOverrides(): Partial<Record<FeatureFlag, boolean>> {
  return { ...remoteOverrides };
}

export function listDefaultFlags(): Readonly<Record<FeatureFlag, boolean>> {
  return DEFAULT_FLAGS;
}

export function listFeatureFlags(): FeatureFlag[] {
  return FEATURE_FLAG_DEFINITIONS.map((definition) => definition.id);
}
