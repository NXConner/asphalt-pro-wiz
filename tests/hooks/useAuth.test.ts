import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useAuth } from '@/hooks/useAuth';

vi.mock('@/integrations/supabase/client', async () => {
  const { createSupabaseModuleMock } = await import('../utils/supabaseMock');
  return createSupabaseModuleMock();
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const { supabase } = await import('@/integrations/supabase/client');

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('should handle authentication state', async () => {
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback('SIGNED_IN', { user: { id: '1' } } as any);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
