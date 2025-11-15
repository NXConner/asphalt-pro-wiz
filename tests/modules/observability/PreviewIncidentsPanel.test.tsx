import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PreviewIncidentsPanel } from '@/modules/observability/PreviewIncidentsPanel';

const baseIncident = {
  id: '1',
  org_id: null,
  user_id: null,
  created_by: null,
  session_id: null,
  device_id: null,
  event_type: 'lovable.asset_load_error',
  severity: 'critical' as const,
  asset_url: 'https://cdn.test/app.js',
  asset_tag: 'script',
  page_url: 'https://preview.lovable.dev/home',
  referrer: null,
  reason: '404 Not Found',
  message: 'Asset failed to load',
  environment: 'preview',
  user_agent: 'Chrome',
  incident_hash: 'hash1',
  occurred_at: new Date().toISOString(),
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('PreviewIncidentsPanel', () => {
  it('renders stable state when no incidents present', () => {
    render(
      <PreviewIncidentsPanel
        data={{
          incidents: [],
          summary: [],
          stats: {
            total: 0,
            lastHour: 0,
            lastDay: 0,
            affectedAssets: 0,
            mostRecentOccurredAt: null,
            severityCounts: {
              info: 0,
              warning: 0,
              error: 0,
              critical: 0,
            },
          },
          hasActiveAlert: false,
        }}
        isLoading={false}
        isError={false}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText('Preview Asset Health')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('No incidents recorded')).toBeInTheDocument();
  });

  it('highlights critical incidents and lists items', () => {
    render(
      <PreviewIncidentsPanel
        data={{
          incidents: [baseIncident],
          summary: [
            {
              asset_url: baseIncident.asset_url,
              page_url: baseIncident.page_url,
              event_type: baseIncident.event_type,
              severity: 'critical',
              total_events: 4,
              last_occurred_at: baseIncident.occurred_at,
              first_occurred_at: baseIncident.occurred_at,
              events_last_hour: 3,
              events_last_day: 4,
            },
          ],
          stats: {
            total: 4,
            lastHour: 3,
            lastDay: 4,
            affectedAssets: 1,
            mostRecentOccurredAt: baseIncident.occurred_at,
            severityCounts: {
              info: 0,
              warning: 0,
              error: 0,
              critical: 1,
            },
          },
          hasActiveAlert: true,
        }}
        isLoading={false}
        isError={false}
        onRefresh={() => {}}
      />,
    );

    expect(screen.getByText('Active incidents')).toBeInTheDocument();
    expect(screen.getByText(baseIncident.asset_url!)).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    const { container } = render(
      <PreviewIncidentsPanel
        data={undefined}
        isLoading
        isError={false}
        onRefresh={() => {}}
      />,
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
  });
});
