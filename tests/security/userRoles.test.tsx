import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthProvider } from '@/contexts/AuthContext';
import { useUserRole, useIsAdmin } from '@/hooks/useUserRole';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
};

vi.mock('@/integrations/supabase/client', async () => {
  const actual = await vi.importActual<typeof import('@/integrations/supabase/client')>(
    '@/integrations/supabase/client',
  );

  const auth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  };

  const from = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  }));

  return {
    ...actual,
    supabase: {
      auth,
      from,
    },
    supabaseConfigurationError: null,
    isSupabaseConfigured: true,
  };
});

const { supabase } = await import('@/integrations/supabase/client');

describe('useUserRole', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('returns empty roles when not authenticated', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useUserRole(), { wrapper });

    await waitFor(() => {
      expect(result.current.roles).toEqual([]);
      expect(result.current.isAdmin).toBe(false);
    });
  });

  it('checks if user has specific role', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
        },
      },
      error: null,
    });

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ user_id: 'test-user-id', role: 'Administrator' }],
          error: null,
        })),
      })),
    });

    const { result } = renderHook(() => useUserRole(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasRole('Administrator')).toBe(true);
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('identifies admin users correctly', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
        },
      },
      error: null,
    });

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ user_id: 'test-user-id', role: 'Super Administrator' }],
          error: null,
        })),
      })),
    });

    const { result } = renderHook(() => useIsAdmin(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });
  });

  it('identifies non-admin users correctly', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: mockUser,
          access_token: 'token',
        },
      },
      error: null,
    });

    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [{ user_id: 'test-user-id', role: 'Field Technician' }],
          error: null,
        })),
      })),
    });

    const { result } = renderHook(() => useIsAdmin(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
    });
  });
});
