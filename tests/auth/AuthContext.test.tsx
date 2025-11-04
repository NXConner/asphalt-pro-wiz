import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthContext', () => {
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

  it('provides authentication context', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });

  it('starts with unauthenticated state', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  it('provides sign in method', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.signIn).toBeInstanceOf(Function);
    });
  });

  it('provides sign up method', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.signUp).toBeInstanceOf(Function);
    });
  });

  it('provides sign out method', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.signOut).toBeInstanceOf(Function);
    });
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuthContext());
    }).toThrow('useAuthContext must be used within AuthProvider');
  });
});
