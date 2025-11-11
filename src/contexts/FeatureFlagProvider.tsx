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
  logFeatureFlagAuditSnapshot,
  logFeatureFlagRemoteOverrideApplied,
  logFeatureFlagSync,
  setRemoteFlags,
  type FeatureFlag,
} from '@/lib/featureFlags';

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
  if (!isSupabaseConfigured()) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_org_memberships' as any)
      .select('org_id')
      .eq('user_id', userId)
      .order('joined_at', { ascending: true })
      .limit(1);
    
    // Handle 404 errors gracefully (table doesn't exist)
    if (error) {
      const code = error?.code || error?.status || '';
      if (code === 'PGRST116' || code === '42P01' || String(code).includes('404')) {
        // Table doesn't exist - expected in development
        return null;
      }
      throw error;
    }
    
    if (!Array.isArray(data) || data.length === 0) return null;
    const row = data[0] as unknown as Record<string, unknown> | null;
    if (!row) return null;
    const orgId = row['org_id'];
    if (!orgId) return null;
    return String(orgId);
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
        logFeatureFlagSync('started', { userId: user.id });
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

        // Handle 404 errors gracefully (expected when tables don't exist yet)
        const errors = [featureFlagsRes.error, orgFlagsRes.error, userFlagsRes.error].filter(Boolean);
        const non404Errors = errors.filter((err: any) => {
          const code = err?.code || err?.status || '';
          return code !== 'PGRST116' && code !== '42P01' && !String(code).includes('404');
        });
        
        if (non404Errors.length > 0) {
          throw non404Errors[0]!;
        }
        
        // If all errors are 404s, treat as if tables don't exist (use defaults)
        if (errors.length > 0 && errors.length === [featureFlagsRes.error, orgFlagsRes.error, userFlagsRes.error].filter(Boolean).length) {
          // All queries returned 404 - tables likely don't exist, use defaults
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
            flags: {},
          }));
          // Don't log 404 errors as failures - tables just don't exist yet (expected in development)
          logFeatureFlagSync('failed', { 
            userId: user.id, 
            reason: 'tables_not_found',
            silent: true, // Suppress console logging for expected failures
          });
          return;
        }

        const overrides: Partial<Record<FeatureFlag, boolean>> = {};
        const assignOverride = (flagId: string | null | undefined, value: unknown) => {
          if (!flagId || !isKnownFeatureFlag(flagId) || typeof value !== 'boolean') return;
          overrides[flagId] = value;
        };

        const featureFlagsData = Array.isArray(featureFlagsRes.data) ? featureFlagsRes.data : [];
        for (const item of featureFlagsData) {
          const row = item as unknown as Record<string, unknown> | null;
          if (!row) continue;
          const id = row['id'];
          const enabled = row['default_enabled'];
          if (id != null) {
            assignOverride(String(id), enabled);
          }
        }

        const orgFlagsData = Array.isArray(orgFlagsRes.data) ? orgFlagsRes.data : [];
        for (const item of orgFlagsData) {
          const row = item as unknown as Record<string, unknown> | null;
          if (!row) continue;
          const flagId = row['flag_id'];
          const enabled = row['enabled'];
          if (flagId != null) {
            assignOverride(String(flagId), enabled);
          }
        }

        const userFlagsData = Array.isArray(userFlagsRes.data) ? userFlagsRes.data : [];
        for (const item of userFlagsData) {
          const row = item as unknown as Record<string, unknown> | null;
          if (!row) continue;
          const flagId = row['flag_id'];
          const enabled = row['enabled'];
          if (flagId != null) {
            assignOverride(String(flagId), enabled);
          }
        }

        const overrideCount = Object.keys(overrides).length;

        clearRemoteFlags();
        setRemoteFlags(overrides);
        logFeatureFlagRemoteOverrideApplied(overrides, {
          userId: user.id,
          orgId,
          overrideCount,
        });

        logFeatureFlagSync('success', {
          userId: user.id,
          orgId,
          overrideCount,
          remoteSource: 'supabase',
        });

        logFeatureFlagAuditSnapshot({
          userId: user.id,
          orgId,
          overrideCount,
          syncSource: 'supabase',
        });

        setState({
          flags: getFlags(),
          remoteOverrides: getRemoteOverrides(),
          isLoading: false,
          error: null,
          lastSyncedAt: new Date().toISOString(),
        });
      } catch (error) {
        logFeatureFlagSync('failed', {
          userId: user?.id ?? null,
          error: error instanceof Error ? error.message : String(error),
        });
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
