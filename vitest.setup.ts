import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const createMockChannel = () => {
  const unsubscribe = vi.fn();
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockImplementation((callback?: (status: string) => void) => {
      callback?.('SUBSCRIBED');
      return Promise.resolve({ data: { subscription: { unsubscribe } } });
    }),
    unsubscribe,
  };
  return channel;
};

const createSupabaseAuthMock = () => {
  const authSubscription = { unsubscribe: vi.fn() };
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn().mockImplementation((callback) => {
      callback?.('INITIAL_SESSION', null);
      return { data: { subscription: authSubscription } };
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };
};

vi.mock('@/integrations/supabase/client', () => {
  const auth = createSupabaseAuthMock();
  return {
    supabase: {
      auth,
      channel: vi.fn(() => createMockChannel()),
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn(),
      })),
    },
    supabaseConfigurationError: null,
    isSupabaseConfigured: false,
  };
});

vi.mock('@/lib/logging', () => {
  const logEvent = vi.fn();
  return {
    logEvent,
    logError: vi.fn(),
    logVital: vi.fn(),
    setLogContext: vi.fn(),
  };
});
