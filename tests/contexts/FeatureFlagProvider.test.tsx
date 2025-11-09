import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FeatureFlagProvider,
  useFeatureFlagsContext,
} from '@/contexts/FeatureFlagProvider';

const authStub = {
  user: { id: 'user-1' } as any,
  session: null,
  loading: false,
  isAuthenticated: true,
  isConfigured: true,
  configurationError: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => authStub,
}));

vi.mock('@/lib/logging', () => ({
  logEvent: vi.fn(),
}));

const featureFlagsFixture: any[] = [];
const orgFlagsFixture: any[] = [];
const userFlagsFixture: any[] = [];
const membershipsFixture: any[] = [];

vi.mock('@/integrations/supabase/client', async () => {
  const { createSupabaseModuleMock, createSupabaseQueryChain } = await import('../utils/supabaseMock');
  const from = vi.fn((table: string) => {
    if (table === 'feature_flags') {
      return createSupabaseQueryChain({ data: [...featureFlagsFixture], error: null });
    }
    if (table === 'org_feature_flags') {
      return createSupabaseQueryChain({ data: [...orgFlagsFixture], error: null });
    }
    if (table === 'user_feature_flags') {
      return createSupabaseQueryChain({ data: [...userFlagsFixture], error: null });
    }
    if (table === 'user_org_memberships') {
      return createSupabaseQueryChain({ data: [...membershipsFixture], error: null });
    }
    return createSupabaseQueryChain();
  });
  return createSupabaseModuleMock({ from });
});

function Consumer() {
  const { flags, remoteOverrides, isLoading } = useFeatureFlagsContext();
  if (isLoading) {
    return <div data-testid="loading">loading</div>;
  }

  return (
    <div>
      <span data-testid="flag-command">{String(flags.commandCenter)}</span>
      <span data-testid="flag-scheduler">{String(flags.scheduler)}</span>
      <span data-testid="remote-count">{Object.keys(remoteOverrides).length}</span>
    </div>
  );
}

function renderWithProvider(children: ReactNode) {
  return render(<FeatureFlagProvider>{children}</FeatureFlagProvider>);
}

describe('FeatureFlagProvider', () => {
  beforeEach(() => {
    featureFlagsFixture.splice(0, featureFlagsFixture.length);
    orgFlagsFixture.splice(0, orgFlagsFixture.length);
    userFlagsFixture.splice(0, userFlagsFixture.length);
    membershipsFixture.splice(0, membershipsFixture.length);
    authStub.user = { id: 'user-1' } as any;
    authStub.isAuthenticated = true;
    authStub.loading = false;
  });

  it('hydrates remote overrides from Supabase', async () => {
    featureFlagsFixture.push({ id: 'commandCenter', default_enabled: true });
    orgFlagsFixture.push({ flag_id: 'scheduler', enabled: true, org_id: 'org-1' });
    userFlagsFixture.push({ flag_id: 'optimizer', enabled: true, user_id: 'user-1' });
    membershipsFixture.push({ org_id: 'org-1' });

    renderWithProvider(<Consumer />);

    await waitFor(() =>
      expect(screen.getByTestId('flag-command').textContent).toBe('true'),
    );
    expect(screen.getByTestId('flag-scheduler').textContent).toBe('true');
    expect(Number(screen.getByTestId('remote-count').textContent)).toBeGreaterThanOrEqual(2);
  });

  it('clears overrides when user signs out', async () => {
    featureFlagsFixture.push({ id: 'commandCenter', default_enabled: false });
    userFlagsFixture.push({ flag_id: 'commandCenter', enabled: true, user_id: 'user-1' });

    const { rerender } = renderWithProvider(<Consumer />);

    await waitFor(() =>
      expect(screen.getByTestId('flag-command').textContent).toBe('true'),
    );

    authStub.user = null;
    authStub.isAuthenticated = false;
    rerender(
      <FeatureFlagProvider>
        <Consumer />
      </FeatureFlagProvider>,
    );

    await waitFor(() => {
      const values = screen.getAllByTestId('remote-count').map((node) => node.textContent);
      expect(values[values.length - 1]).toBe('0');
    });
  });
});
