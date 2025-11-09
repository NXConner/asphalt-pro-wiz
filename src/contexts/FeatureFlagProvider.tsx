import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import {
  clearRemoteFlags,
  FEATURE_FLAGS,
  getFlags,
  getRemoteOverrides,
  isKnownFeatureFlag,
  setRemoteFlags,
  type FeatureFlag,
} from '@/lib/flags';
import { logEvent } from '@/lib/logging';

interface FeatureFlagContextValue {
  flags: Record<FeatureFlag, boolean>;
  remoteOverrides: Partial<Record<FeatureFlag, boolean>>;
  isLoading: boolean;
  error: Error | null;
  lastSyncedAt: string | null;
  refresh: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

async function resolvePrimaryOrgId(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_org_memberships' as any)
      .select('org_id')
      .eq('user_id', userId)
      .order('joined_at', { ascending: true })
      .limit(1);
    if (error) throw error;
    return data?.[0]?.org_id ?? null;
  } catch {
    return null;
  }
}

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    isConfigured: authConfigured,
  } = useAuthContext();
  const [state, setState] = useState<Omit<FeatureFlagContextValue, 'refresh'>>({
    flags: getFlags(),
    remoteOverrides: getRemoteOverrides(),
    isLoading: false,
    error: null,
    lastSyncedAt: null,
  });

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !authConfigured) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      return;
    }

    if (!user || !isAuthenticated) {
      clearRemoteFlags();
      setState({
        flags: getFlags(),
        remoteOverrides: {},
        isLoading: false,
        error: null,
        lastSyncedAt: null,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      logEvent('flags.remote_sync_started', { userId: user.id });
      const orgId = await resolvePrimaryOrgId(user.id);

      const [featureFlagsRes, orgFlagsRes, userFlagsRes] = await Promise.all([
        supabase.from('feature_flags' as any).select('id, default_enabled'),
        orgId
          ? supabase
              .from('org_feature_flags' as any)
              .select('flag_id, enabled')
              .eq('org_id', orgId)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('user_feature_flags' as any)
          .select('flag_id, enabled')
          .eq('user_id', user.id),
      ]);

      const errors = [featureFlagsRes.error, orgFlagsRes.error, userFlagsRes.error].filter(Boolean);
      if (errors.length > 0) {
        throw errors[0]!;
      }

      const overrides: Partial<Record<FeatureFlag, boolean>> = {};
      const assignOverride = (flagId: string | null | undefined, value: unknown) => {
        if (!flagId || !isKnownFeatureFlag(flagId) || typeof value !== 'boolean') return;
        overrides[flagId] = value;
      };

      for (const row of featureFlagsRes.data ?? []) {
        assignOverride(row?.id, row?.default_enabled);
      }

      for (const row of orgFlagsRes.data ?? []) {
        assignOverride(row?.flag_id, row?.enabled);
      }

      for (const row of userFlagsRes.data ?? []) {
        assignOverride(row?.flag_id, row?.enabled);
      }

      clearRemoteFlags();
      setRemoteFlags(overrides);

      logEvent('flags.remote_sync_success', {
        userId: user.id,
        orgId,
        overrides: overrides,
      });

      setState({
        flags: getFlags(),
        remoteOverrides: getRemoteOverrides(),
        isLoading: false,
        error: null,
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      logEvent(
        'flags.remote_sync_failed',
        {
          message: error instanceof Error ? error.message : String(error),
        },
        'error',
      );
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [authConfigured, isAuthenticated, user]);

  useEffect(() => {
    if (!isSupabaseConfigured || authLoading) {
      return;
    }

    if (!user || !isAuthenticated) {
      clearRemoteFlags();
      setState({
        flags: getFlags(),
        remoteOverrides: {},
        isLoading: false,
        error: null,
        lastSyncedAt: null,
      });
      return;
    }

    void refresh();
  }, [authLoading, user, isAuthenticated, refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setState((prev) => ({
        ...prev,
        flags: getFlags(),
      }));
    };
    window.addEventListener('storage', handler);
    window.addEventListener('pps:flags:update', handler as EventListener);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('pps:flags:update', handler as EventListener);
    };
  }, []);

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlagsContext(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlagsContext must be used within FeatureFlagProvider');
  }
  return context;
}

export function useFeatureFlagValue(flag: FeatureFlag): boolean {
  const { flags } = useFeatureFlagsContext();
  return flags[flag];
}

export function useFeatureFlagsList(): Array<{ flag: FeatureFlag; enabled: boolean }> {
  const { flags } = useFeatureFlagsContext();
  return FEATURE_FLAGS.map((flag) => ({ flag, enabled: flags[flag] }));
}
