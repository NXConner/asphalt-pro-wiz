import type { User, Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  supabase,
  isSupabaseConfigured,
  supabaseConfigurationError,
  SupabaseConfigurationError,
} from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const configurationError = useMemo(
    () => supabaseConfigurationError ?? (isSupabaseConfigured ? null : new SupabaseConfigurationError()),
    [],
  );

  useEffect(() => {
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
    if (!isSupabaseConfigured) {
      const error = configurationError ?? new SupabaseConfigurationError();
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    ensureConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Signed in successfully');
  };

  const signUp = async (email: string, password: string) => {
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
    isConfigured: isSupabaseConfigured,
    configurationError,
  };
}
