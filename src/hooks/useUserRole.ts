import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

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

export function useUserRole() {
  const { user, isAuthenticated } = useAuthContext();

  const { data: assignmentRows = [], isLoading } = useQuery<UserRoleRow[]>({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      return data ?? [];
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

  const hasRole = (role: AppRole): boolean => roles.includes(role);

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
