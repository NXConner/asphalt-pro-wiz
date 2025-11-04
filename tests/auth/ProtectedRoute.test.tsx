import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const { supabase } = await import('@/integrations/supabase/client');

describe('ProtectedRoute', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while checking auth', () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper },
    );

    // Initially shows loading
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to auth when not authenticated', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper },
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth', { replace: true });
    });
  });

  it('renders children when authenticated', async () => {
    const mockSession = {
      user: { id: 'test-user', email: 'test@example.com' },
      access_token: 'token',
    };

    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper },
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
