import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePreviewAssetIncidents } from '@/hooks/usePreviewAssetIncidents';

const incidentsFixture: any[] = [];
const summaryFixture: any[] = [];

vi.mock('@/integrations/supabase/client', async () => {
  const { createSupabaseModuleMock, createSupabaseQueryChain } = await import('../utils/supabaseMock');
  const from = vi.fn((table: string) => {
    if (table === 'preview_asset_incidents') {
      return createSupabaseQueryChain({ data: [...incidentsFixture], error: null });
    }
    if (table === 'preview_asset_incident_summary') {
      return createSupabaseQueryChain({ data: [...summaryFixture], error: null });
    }
    return createSupabaseQueryChain();
  });
  return createSupabaseModuleMock({ from });
});

describe('usePreviewAssetIncidents', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    incidentsFixture.splice(0, incidentsFixture.length);
    summaryFixture.splice(0, summaryFixture.length);
    vi.clearAllMocks();
  });

  it('returns default stats when no incidents recorded', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePreviewAssetIncidents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.stats).toEqual({
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
    });
    expect(result.current.data?.hasActiveAlert).toBe(false);
  });

  it('calculates aggregates and flags active alerts', async () => {
    const now = new Date().toISOString();
    incidentsFixture.push(
      {
        id: '1',
        event_type: 'lovable.asset_load_error',
        severity: 'critical',
        asset_url: 'https://cdn.test/app.js',
        asset_tag: 'script',
        page_url: 'https://preview.lovable.dev/home',
        occurred_at: now,
      },
      {
        id: '2',
        event_type: 'lovable.asset_promise_rejection',
        severity: 'error',
        asset_url: 'https://cdn.test/vendor.js',
        asset_tag: 'script',
        page_url: 'https://preview.lovable.dev/home',
        occurred_at: now,
      },
    );
    summaryFixture.push({
      asset_url: 'https://cdn.test/app.js',
      page_url: 'https://preview.lovable.dev/home',
      event_type: 'lovable.asset_load_error',
      severity: 'critical',
      total_events: 3,
      last_occurred_at: now,
      first_occurred_at: now,
      events_last_hour: 2,
      events_last_day: 3,
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePreviewAssetIncidents(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.stats.total).toBe(3);
    expect(result.current.data?.stats.lastHour).toBe(2);
    expect(result.current.data?.stats.lastDay).toBe(3);
    expect(result.current.data?.stats.affectedAssets).toBe(1);
    expect(result.current.data?.stats.severityCounts.critical).toBe(1);
    expect(result.current.data?.stats.severityCounts.error).toBe(1);
    expect(result.current.data?.hasActiveAlert).toBe(true);
  });

  it('respects the enabled option', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => usePreviewAssetIncidents({ enabled: false }),
      { wrapper },
    );

    expect(result.current.isPending || result.current.isSuccess).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});
