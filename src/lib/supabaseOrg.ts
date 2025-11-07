import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logging';
import type { UserOrgMembershipRow } from '@/integrations/supabase/types';

export async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function resolveOrgId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('current_user_default_org');
    if (!error && data) {
      return data as string;
    }
  } catch (error) {
    logError(error, { source: 'supabase.resolveOrg.rpc' });
  }

  const { data: memberships, error } = await supabase
    .from('user_org_memberships')
    .select<'user_org_memberships', Pick<UserOrgMembershipRow, 'org_id'>>('org_id')
    .order('joined_at', { ascending: true })
    .limit(1);

  if (error) throw error;
  return memberships?.[0]?.org_id ?? null;
}
