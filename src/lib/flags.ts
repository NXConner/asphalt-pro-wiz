export type FeatureFlag =
  | 'imageAreaAnalyzer'
  | 'aiAssistant'
  | 'pwa'
  | 'i18n'
  | 'receipts'
  | 'ownerMode'
  | 'scheduler'
  | 'optimizer'
  | 'customerPortal'
  | 'observability'
  | 'commandCenter'
  | 'tacticalMapV2';

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  imageAreaAnalyzer: true,
  aiAssistant: true,
  pwa: true,
  i18n: true,
  receipts: true,
  ownerMode: false,
  scheduler: false,
  optimizer: false,
  customerPortal: false,
  observability: true,
  commandCenter: true,
  tacticalMapV2: true,
};

const STORAGE_KEY = 'pps:flags';

export const FEATURE_FLAGS = Object.keys(DEFAULT_FLAGS) as FeatureFlag[];
const FEATURE_FLAG_SET = new Set<FeatureFlag>(FEATURE_FLAGS);

let remoteOverrides: Partial<Record<FeatureFlag, boolean>> = {};

function readLocalFlags(): Record<FeatureFlag, boolean> {
  try {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_FLAGS };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FLAGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FLAGS, ...parsed } as Record<FeatureFlag, boolean>;
  } catch {
    return { ...DEFAULT_FLAGS };
  }
}

export function isKnownFeatureFlag(value: string): value is FeatureFlag {
  return FEATURE_FLAG_SET.has(value as FeatureFlag);
}

export function getFlags(): Record<FeatureFlag, boolean> {
  const local = readLocalFlags();
  return {
    ...local,
    ...remoteOverrides,
  };
}

export function setFlag(flag: FeatureFlag, enabled: boolean): void {
  const localFlags = readLocalFlags();
  localFlags[flag] = enabled;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localFlags));
    }
  } catch {
    // ignore storage write issues
  }
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pps:flags:update'));
    }
  } catch {
    // ignore dispatch issues
  }
}

export function isEnabled(flag: FeatureFlag): boolean {
  const remoteValue = remoteOverrides[flag];
  if (typeof remoteValue === 'boolean') {
    return remoteValue;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<FeatureFlag, boolean>>;
        if (flag in parsed) {
          return Boolean(parsed[flag]);
        }
      }
    }
  } catch {
    // ignore storage parsing issues
  }

  const envOverride = (import.meta as unknown as { env?: Record<string, string> })?.env?.[
    `VITE_FLAG_${flag.toUpperCase()}`
  ];
  if (typeof envOverride === 'string') {
    return envOverride === '1' || envOverride.toLowerCase() === 'true';
  }

  return DEFAULT_FLAGS[flag];
}

export function setRemoteFlags(overrides: Partial<Record<FeatureFlag, boolean>>): void {
  const next: Partial<Record<FeatureFlag, boolean>> = { ...remoteOverrides };
  for (const [key, value] of Object.entries(overrides)) {
    if (isKnownFeatureFlag(key) && typeof value === 'boolean') {
      next[key] = value;
    }
  }
  remoteOverrides = next;
}

export function clearRemoteFlags(): void {
  remoteOverrides = {};
}

export function getRemoteOverrides(): Partial<Record<FeatureFlag, boolean>> {
  return { ...remoteOverrides };
}
