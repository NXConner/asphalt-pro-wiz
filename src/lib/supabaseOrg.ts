import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logging';

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function resolveOrgId(): Promise<string | null> {
  try {
    // First try to get from RPC if it exists
    const { data: rpcData } = await (supabase as any).rpc('current_user_default_org').maybeSingle();
    if (rpcData) {
      return rpcData as string;
    }
  } catch (error) {
    // RPC might not exist, continue to fallback
    logError(error, { source: 'supabase.resolveOrg.rpc' });
  }

  try {
    // Fallback: query user_org_memberships if the table exists
    const { data: memberships, error } = await (supabase as any)
      .from('user_org_memberships')
      .select('org_id')
      .order('joined_at', { ascending: true })
      .limit(1);

    if (!error && memberships && memberships.length > 0) {
      return memberships[0]?.org_id ?? null;
    }
  } catch (error) {
    logError(error, { source: 'supabase.resolveOrg.fallback' });
  }

  return null;
}
