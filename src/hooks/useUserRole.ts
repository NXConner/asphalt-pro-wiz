import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { RoleName, UserRoleRow } from '@/integrations/supabase/types-helpers';

export type AppRole = RoleName;

export const ROLE_LABELS: Record<RoleName, string> = {
  'Super Administrator': 'Super Admin',
  'Administrator': 'Administrator',
  'Estimator': 'Estimator',
  'Field Crew Lead': 'Field Crew Lead',
  'Field Technician': 'Field Technician',
  'Client': 'Client',
};

const ADMIN_ROLES: RoleName[] = ['Super Administrator', 'Administrator'];

const normalizeRoleName = (value: unknown): RoleName | null => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  switch (normalized) {
    case 'viewer':
    case 'client':
      return 'Client';
    case 'operator':
    case 'estimator':
      return 'Estimator';
    case 'field tech':
    case 'field_tech':
    case 'field technician':
      return 'Field Technician';
    case 'field crew lead':
    case 'crew lead':
      return 'Field Crew Lead';
    case 'manager':
    case 'moderator':
    case 'administrator':
    case 'admin':
      return 'Administrator';
    case 'super_admin':
    case 'super admin':
    case 'super administrator':
      return 'Super Administrator';
    default:
      return null;
  }
};

export function useUserRole() {
  const { user, isAuthenticated } = useAuthContext();

  const { data: assignmentRows = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data ?? []) as Array<{ id: string; user_id: string; role: RoleName; created_at: string }>;
    },
    enabled: isAuthenticated && !!user,
  });

  const roles = useMemo(
    () =>
      (assignmentRows ?? [])
        .map((row) => row.role)
        .filter((role): role is RoleName => Boolean(role)) ?? [],
    [assignmentRows],
  );

  const hasRole = (role: AppRole | string): boolean => {
    const normalized = normalizeRoleName(role);
    if (!normalized) return false;
    return roles.includes(normalized);
  };

  const isAdmin = hasRole('Super Administrator') || hasRole('Administrator');
  const isModerator = hasRole('Administrator');
  const isEstimator = hasRole('Estimator');
  const isFieldTech = hasRole('Field Crew Lead') || hasRole('Field Technician');
  const isClient = hasRole('Client');

  return {
    roles,
    roleLabels: ROLE_LABELS,
    hasRole,
    isAdmin,
    isModerator,
    isEstimator,
    isFieldTech,
    isClient,
    isLoading,
  };
}

/**
 * Hook to check if current user has admin privileges
 * Useful for conditional rendering of admin features
 */
export function useIsAdmin() {
  const { isAdmin, isLoading } = useUserRole();
  return { isAdmin, isLoading };
}
