import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useRealtime } from '@/hooks/useRealtime';

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
  },
}));

const { supabase } = await import('@/integrations/supabase/client');

describe('useRealtime', () => {
  const queryClient = new QueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to realtime changes', () => {
    renderHook(() => useRealtime({ table: 'test_table' }), { wrapper });

    expect(supabase.channel).toHaveBeenCalledWith('test_table_realtime');
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useRealtime({ table: 'test_table' }), { wrapper });

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });

  it('should handle custom filters', () => {
    renderHook(
      () =>
        useRealtime({
          table: 'test_table',
          filter: 'user_id=eq.123',
        }),
      { wrapper },
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        filter: 'user_id=eq.123',
      }),
      expect.any(Function),
    );
});
});
