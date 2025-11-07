const detectRuntimeEnv = (): Record<string, unknown> => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
    return (import.meta as any).env as Record<string, unknown>;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env as Record<string, unknown>;
  }
  return {};
};

const RUNTIME_ENV = detectRuntimeEnv();

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return Boolean(value);
};

export const isDemoModeEnabled = (): boolean =>
  toBoolean(
    RUNTIME_ENV.VITE_DEMO_MODE ??
      RUNTIME_ENV.DEMO_MODE ??
      RUNTIME_ENV.PPS_DEMO_MODE ??
      RUNTIME_ENV.PPS_E2E_DEMO,
  );

export const runtimeEnv = RUNTIME_ENV;
