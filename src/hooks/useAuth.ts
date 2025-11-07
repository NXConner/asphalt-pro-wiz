import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  SupabaseConfigurationError,
  isSupabaseConfigured,
  supabase,
  supabaseConfigurationError,
} from '@/integrations/supabase/client';
import { isDemoModeEnabled } from '@/lib/runtimeEnv';

const demoModeEnabled = isDemoModeEnabled();
const DEMO_AUTH_STORAGE_KEY = 'pps:demo-auth';

const createDemoUser = (email: string): User => {
  const nowIso = new Date().toISOString();
  return {
    id: `demo-${email}-${nowIso}`,
    aud: 'authenticated',
    email,
    role: 'authenticated',
    confirmed_at: nowIso,
    created_at: nowIso,
    email_confirmed_at: nowIso,
    last_sign_in_at: nowIso,
    updated_at: nowIso,
    is_anonymous: false,
    phone: '',
    app_metadata: { provider: 'demo', providers: ['demo'] },
    user_metadata: {},
    factors: [],
    identities: [],
  } as User;
};

const createDemoSession = (user: User): Session => {
  const expiresIn = 3600;
  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    refresh_token: 'demo-refresh-token',
    user,
  } as Session;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const readDemoAuthState = (): { email?: string } | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as { email?: string };
    }
  } catch {
    // ignore malformed storage
  }
  return null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    if (demoModeEnabled) {
      const stored = readDemoAuthState();
      if (stored) {
        const user = createDemoUser(stored.email ?? 'demo@pps.test');
        const session = createDemoSession(user);
        return { user, session, loading: false };
      }
      return { user: null, session: null, loading: false };
    }
    return { user: null, session: null, loading: true };
  });

  const configurationError = useMemo(
    () =>
      demoModeEnabled && !isSupabaseConfigured
        ? null
        : (supabaseConfigurationError ??
          (isSupabaseConfigured ? null : new SupabaseConfigurationError())),
    [],
  );

  useEffect(() => {
    if (demoModeEnabled && !isSupabaseConfigured) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    if (!isSupabaseConfigured) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const listenerResult = supabase.auth?.onAuthStateChange?.((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    });

    const subscription = listenerResult?.data?.subscription;

    const getSessionResult = supabase.auth?.getSession?.();
    if (typeof getSessionResult?.then === 'function') {
      getSessionResult
        .then((result) => {
          const session = result?.data?.session ?? null;
          setState({ user: session?.user ?? null, session, loading: false });
        })
        .catch(() => {
          setState((prev) => ({ ...prev, loading: false }));
        });
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const ensureConfigured = () => {
    if (!isSupabaseConfigured && !demoModeEnabled) {
      const error = configurationError ?? new SupabaseConfigurationError();
      toast.error(error.message);
      throw error;
    }
  };

  const handleDemoAuth = async (email: string) => {
    const demoEmail = email.trim() || 'demo@pps.test';
    const user = createDemoUser(demoEmail);
    const session = createDemoSession(user);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify({ email: demoEmail }));
    }
    setState({ user, session, loading: false });
    await new Promise((resolve) => setTimeout(resolve, 150));
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured && demoModeEnabled) {
      await handleDemoAuth(email);
      toast.success('Signed in successfully (demo mode)');
      return;
    }

    ensureConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Signed in successfully');
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured && demoModeEnabled) {
      await handleDemoAuth(email);
      toast.success('Demo account ready – email confirmation skipped.');
      return;
    }

    ensureConfigured();
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Check your email to confirm your account');
  };

  const signOut = async () => {
    if (!isSupabaseConfigured && demoModeEnabled) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
      }
      setState({ user: null, session: null, loading: false });
      toast.success('Signed out (demo mode)');
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    ensureConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Signed out successfully');
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!state.user,
    isConfigured: isSupabaseConfigured || demoModeEnabled,
    configurationError,
  };
}
