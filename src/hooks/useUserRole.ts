import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

type UserRole = Database['public']['Tables']['user_roles']['Row'];

export function useUserRole() {
  const { user, isAuthenticated } = useAuthContext();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!user,
  });

  const hasRole = (role: AppRole): boolean => {
    return roles.some((r) => r.role === role);
  };

  const isAdmin = hasRole('Administrator') || hasRole('Super Administrator');
  const isModerator = hasRole('Field Crew Lead');
  const isEstimator = hasRole('Estimator');
  const isFieldTech = hasRole('Field Technician');
  const isClient = hasRole('Client');

  return {
    roles,
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
