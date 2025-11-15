import { vi } from 'vitest';

type QueryResult<TData = unknown> = {
  data: TData;
  error: unknown;
};

const defaultResult: QueryResult = {
  data: [],
  error: null,
};

export const createMockChannel = () => {
  const unsubscribe = vi.fn();
  return {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({ data: { subscription: { unsubscribe } } }),
    unsubscribe,
  };
};

export const createSupabaseAuthStub = () => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  onAuthStateChange: vi.fn().mockImplementation((callback) => {
    callback?.('INITIAL_SESSION', null);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
});

export const createSupabaseQueryChain = <TData = unknown>(
  result: QueryResult<TData> = defaultResult,
) => {
  const finalResult: QueryResult<TData> = {
    data: result.data,
    error: result.error ?? null,
  };

  const chain: any = {
    select: vi.fn(() => chain),
    order: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    in: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lte: vi.fn(() => chain),
    match: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => chain),
    maybeSingle: vi.fn(() => chain),
    returns: vi.fn(() => finalResult),
    throwOnError: vi.fn(() => chain),
    abortSignal: vi.fn(() => chain),
    insert: vi.fn(() => Promise.resolve(finalResult)),
    update: vi.fn(() => Promise.resolve(finalResult)),
    delete: vi.fn(() => Promise.resolve(finalResult)),
    then: vi.fn(
      (
        onFulfilled?: (value: QueryResult<TData>) => unknown,
        onRejected?: (reason: unknown) => unknown,
      ) => Promise.resolve(finalResult).then(onFulfilled, onRejected),
    ),
    exec: vi.fn(() => Promise.resolve(finalResult)),
  };

  return chain;
};

export class MockSupabaseConfigurationError extends Error {
  constructor(message?: string) {
    super(message ?? 'Supabase not configured during tests');
    this.name = 'SupabaseConfigurationError';
  }
}

export type SupabaseQueryFn = ReturnType<typeof vi.fn>;

export interface SupabaseMockOverrides {
  auth?: ReturnType<typeof createSupabaseAuthStub>;
  from?: ReturnType<typeof vi.fn>;
  channel?: ReturnType<typeof createMockChannel>;
  additionalSupabaseProps?: Record<string, unknown>;
  isSupabaseConfigured?: boolean;
  supabaseConfigurationError?: Error | null;
}

export const createSupabaseModuleMock = (overrides: SupabaseMockOverrides = {}) => {
  const auth = overrides.auth ?? createSupabaseAuthStub();
  const from = overrides.from ?? vi.fn(() => createSupabaseQueryChain());
  const channelFactory = overrides.channel
    ? vi.fn(() => overrides.channel)
    : vi.fn(() => createMockChannel());
  const additional = overrides.additionalSupabaseProps ?? {};

  if (additional.auth && typeof additional.auth === 'object') {
    Object.assign(auth, additional.auth);
    delete (additional as Record<string, unknown>).auth;
  }

  return {
    supabase: {
      auth,
      channel: channelFactory,
      from,
      ...additional,
    },
    isSupabaseConfigured: overrides.isSupabaseConfigured ?? true,
    supabaseConfigurationError: overrides.supabaseConfigurationError ?? null,
    SupabaseConfigurationError: MockSupabaseConfigurationError,
  };
};
