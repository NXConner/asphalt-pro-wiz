export type FeatureFlag =
  | "imageAreaAnalyzer"
  | "aiAssistant"
  | "pwa"
  | "i18n"
  | "receipts"
  | "ownerMode"
  | "scheduler"
  | "optimizer"
  | "customerPortal"
  | "observability"
  | "commandCenter";

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
};

const STORAGE_KEY = "pps:flags";

export function getFlags(): Record<FeatureFlag, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FLAGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FLAGS, ...parsed } as Record<FeatureFlag, boolean>;
  } catch {
    return { ...DEFAULT_FLAGS };
  }
}

export function setFlag(flag: FeatureFlag, enabled: boolean): void {
  const flags = getFlags();
  flags[flag] = enabled;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

export function isEnabled(flag: FeatureFlag): boolean {
  const envOverride = (import.meta as unknown as { env?: Record<string, string> })?.env?.[
    `VITE_FLAG_${flag.toUpperCase()}`
  ];
  if (typeof envOverride === "string") {
    return envOverride === "1" || envOverride.toLowerCase() === "true";
  }
  return getFlags()[flag];
}
