import { describe, expect, it } from 'vitest';

import type { JobTelemetryStats } from '@/hooks/useTelemetry';
import { deriveMissionActivity } from '@/modules/mission-control/useMissionActivity';

const baseStats = (): JobTelemetryStats => ({
  totalJobs: 0,
  activeJobs: 0,
  statusCounts: {},
  statusDistribution: [],
  totalQuoteValue: 0,
  totalAreaSqft: 0,
  recentJobs: [],
  jobsByLocation: [],
  mappedJobCount: 0,
  lastEventAt: null,
});

describe('deriveMissionActivity', () => {
  it('returns empty collections when stats are null', () => {
    const result = deriveMissionActivity(null);
    expect(result.timeline).toHaveLength(0);
    expect(result.hazards).toHaveLength(0);
    expect(result.waypoints).toHaveLength(0);
  });

  it('maps timeline entries from telemetry stats', () => {
    const stats: JobTelemetryStats = {
      ...baseStats(),
      recentJobs: [
        {
          job_id: 'job-1',
          status: 'in_progress',
          quote_value: 42000,
          area_sqft: 12000,
          location_lat: 37.27,
          location_lng: -79.94,
          customer_address: 'St. Mark Sanctuary',
          created_at: '2025-11-06T14:30:00Z',
          updated_at: '2025-11-06T15:00:00Z',
        },
      ],
      jobsByLocation: [
        {
          job_id: 'job-1',
          status: 'in_progress',
          quote_value: 42000,
          area_sqft: 12000,
          location_lat: 37.27,
          location_lng: -79.94,
          customer_address: 'St. Mark Sanctuary',
          created_at: '2025-11-06T14:30:00Z',
          updated_at: '2025-11-06T15:00:00Z',
        },
      ],
    };

    const result = deriveMissionActivity(stats);
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0]).toMatchObject({
      id: 'job-1',
      status: 'in_progress',
      name: 'St. Mark Sanctuary',
    });
    expect(result.hazards[0]).toMatchObject({
      id: 'job-1',
      severity: 'low',
    });
    expect(result.waypoints[0]).toMatchObject({ id: 'job-1', status: 'in_progress' });
  });

  it('marks cancelled missions as high severity hazards', () => {
    const stats: JobTelemetryStats = {
      ...baseStats(),
      recentJobs: [],
      jobsByLocation: [
        {
          job_id: 'job-2',
          status: 'cancelled',
          quote_value: 15000,
          area_sqft: 8000,
          location_lat: 37.5,
          location_lng: -78.4,
          customer_address: 'Cancelled Campus',
          created_at: '2025-11-05T10:00:00Z',
          updated_at: '2025-11-05T12:00:00Z',
        },
      ],
    };

    const result = deriveMissionActivity(stats);
    expect(result.hazards[0].severity).toBe('high');
  });
});

