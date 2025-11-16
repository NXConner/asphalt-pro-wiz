export type LovablePreviewHealthStatus = 'unknown' | 'healthy' | 'warning' | 'error';

export interface LovablePreviewHealthSnapshot {
  status: LovablePreviewHealthStatus;
  lastHeartbeat?: string;
  message?: string;
  failures?: number;
  url?: string;
}

declare global {
  interface Window {
    __PPS_PREVIEW_HEALTH?: LovablePreviewHealthSnapshot;
  }
}

export {};
