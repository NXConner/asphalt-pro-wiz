import { useCallback, useMemo, useRef, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { EstimatorState } from '@/modules/estimate/useEstimatorState';
import { logError, logEvent } from '@/lib/logging';

export interface AutoMeasurementPayload {
  strategy: 'image' | 'map' | 'drone';
  imageUrl?: string;
  mapViewport?: { lat: number; lng: number; zoom: number };
  droneMissionId?: string;
}

export interface MeasurementIntel {
  squareFeet: number;
  confidence: number;
  segments?: Array<{
    id?: string;
    label: string;
    squareFeet?: number;
    geojson?: Record<string, unknown>;
  }>;
  cracks: {
    linearFeet: number;
    severityScore: number;
    distribution: Record<string, number>;
  };
  notes?: string;
}

export interface DroneIntel {
  ortho?: { url: string; capturedAt: string };
  thermal?: { url: string; pavementDeltaF: number };
  hazards?: Array<{ id: string; description: string; type: string }>;
  recommendations?: string[];
}

export interface MeasurementIntelState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  measurement?: MeasurementIntel;
  drone?: DroneIntel;
  runAutoMeasurement: (payload: AutoMeasurementPayload) => Promise<void>;
  applyMeasurement: (intel: MeasurementIntel) => void;
  reset: () => void;
}

const ENV = import.meta.env as Record<string, string | undefined>;
const readEnv = (key: string, fallback: string) => ENV[key] ?? fallback;

const measurementEndpoint = readEnv('VITE_MEASUREMENT_AI_URL', '/api/measurements');
const segmentationEndpoint = readEnv('VITE_IMAGE_SEGMENTATION_URL', '/api/segmentation');
const droneEndpoint = readEnv('VITE_DRONE_ANALYTICS_URL', '/api/drone-intel');

const MEASUREMENT_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
};

export function useMeasurementIntel(
  estimator: EstimatorState | null,
  jobId?: string | null,
): MeasurementIntelState {
  const [status, setStatus] = useState<MeasurementIntelState['status']>('idle');
  const [error, setError] = useState<string>();
  const [measurement, setMeasurement] = useState<MeasurementIntel>();
  const [drone, setDrone] = useState<DroneIntel>();
  const abortRef = useRef<AbortController>();

  const persistMeasurementRun = useCallback(
    async (intelPayload: MeasurementIntel, strategy: string) => {
      // Database persistence disabled - tables not in current schema
      if (!jobId || !isSupabaseConfigured) return;
      try {
        logEvent('measurement.persist.skipped', { jobId, strategy });
        // Workflow measurement tables not yet migrated
        // TODO: Re-enable once workflow_measurement_runs table is created
      } catch {
        // Silently skip persistence
      }
    },
    [jobId],
  );

  const applyMeasurement = useCallback(
    (intel: MeasurementIntel) => {
      if (!estimator) return;
      setMeasurement(intel);
      estimator.areas.handleImageAreaDetected(intel.squareFeet);
      estimator.cracks.handleCrackLengthDrawn(intel.cracks.linearFeet);
      estimator.cracks.setLength(intel.cracks.linearFeet);
      (intel.segments ?? []).forEach((segment, index) => {
        if (index === 0) {
          estimator.areas.update(estimator.areas.items[0]?.id ?? 0, segment.squareFeet);
        } else {
          estimator.areas.handleAreaDrawn(segment.squareFeet);
        }
      });
      if (jobId) {
        void persistMeasurementRun(intel, 'session');
      }
    },
    [estimator, jobId, persistMeasurementRun],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setError(undefined);
    setMeasurement(undefined);
    setDrone(undefined);
  }, []);

  const runAutoMeasurement = useCallback(
    async (payload: AutoMeasurementPayload) => {
      if (status === 'loading') {
        abortRef.current?.abort();
      }
      setStatus('loading');
      setError(undefined);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const body = JSON.stringify(payload);
        const response = await fetch(measurementEndpoint, {
          method: 'POST',
          headers: MEASUREMENT_HEADERS,
          body,
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Measurement service returned ${response.status}`);
        }
        const intel = (await response.json()) as MeasurementIntel;
        applyMeasurement(intel);
        setStatus('ready');
        setError(undefined);
        logEvent('workflow.measurement.auto_success', { strategy: payload.strategy, confidence: intel.confidence });
        if (jobId) {
          void persistMeasurementRun(intel, payload.strategy);
        }

        if (payload.strategy === 'drone') {
          const droneResp = await fetch(droneEndpoint, {
            method: 'POST',
            headers: MEASUREMENT_HEADERS,
            body: JSON.stringify({ missionId: payload.droneMissionId }),
            signal: controller.signal,
          });
          if (droneResp.ok) {
            setDrone((await droneResp.json()) as DroneIntel);
          }
        } else if (payload.strategy === 'map') {
          await fetch(segmentationEndpoint, {
            method: 'POST',
            headers: MEASUREMENT_HEADERS,
            body,
            signal: controller.signal,
          }).catch(() => undefined);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to run auto measurement.';
        setError(message);
        setStatus('error');
        logError('workflow.measurement.auto_error', { message, payload });
      }
    },
    [status, applyMeasurement, jobId, persistMeasurementRun],
  );

  return useMemo(
    () => ({
      status,
      error,
      measurement,
      drone,
      runAutoMeasurement,
      applyMeasurement,
      reset,
    }),
    [status, error, measurement, drone, runAutoMeasurement, applyMeasurement, reset],
  );
}
