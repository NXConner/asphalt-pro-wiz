export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_PREFIX = "[PPS]";

function isDev(): boolean {
  return (
    import.meta?.env?.MODE === "development" ||
    (globalThis as any)?.process?.env?.NODE_ENV === "development"
  );
}

export function logEvent(
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info",
): void {
  const payload = { ts: new Date().toISOString(), event, ...data };
  try {
    if (isDev()) {
      console.log(`${LOG_PREFIX} ${event}`, payload);
    }
    // Hook for production observability (no-op by default)
    const beaconUrl = (import.meta as any)?.env?.VITE_LOG_BEACON_URL;
    if (beaconUrl && typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify({ level, ...payload })], { type: "application/json" });
      navigator.sendBeacon(beaconUrl as string, blob);
    }
  } catch {
    // ignore
  }
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error };
  logEvent("error", { ...context, ...err }, "error");
}
