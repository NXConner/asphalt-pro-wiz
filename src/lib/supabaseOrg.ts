import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logging';

export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveOrgId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    // First try to get from RPC if it exists
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('current_user_default_org').maybeSingle();
    if (rpcError) {
      // Check if it's a 404 or table doesn't exist - expected in development
      const code = rpcError?.code || '';
      if (code === 'PGRST116' || code === '42P01' || String(code).includes('404')) {
        // Table/function doesn't exist, continue to fallback
      } else {
        throw rpcError;
      }
    } else if (rpcData) {
      return rpcData as string;
    }
  } catch (error) {
    // Only log non-404 errors
    const err = error as any;
    const code = err?.code || err?.status || '';
    if (code !== 'PGRST116' && code !== '42P01' && !String(code).includes('404')) {
      logError(error, { source: 'supabase.resolveOrg.rpc' });
    }
  }

  try {
    // Fallback: query user_org_memberships if the table exists
    const { data: memberships, error } = await (supabase as any)
      .from('user_org_memberships')
      .select('org_id')
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

    if (memberships && memberships.length > 0) {
      return memberships[0]?.org_id ?? null;
    }
  } catch (error) {
    // Only log non-404 errors
    const err = error as any;
    const code = err?.code || err?.status || '';
    if (code !== 'PGRST116' && code !== '42P01' && !String(code).includes('404')) {
      logError(error, { source: 'supabase.resolveOrg.fallback' });
    }
  }

  return null;
}
