import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin, type AppRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus, UserX, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserWithRoles {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: AppRole[];
}

export function AdminPanel() {
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const queryClient = useQueryClient();

  // Fetch all profiles with their roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        roles: roles.filter(r => r.user_id === profile.id).map(r => r.role),
      }));

      return usersWithRoles;
    },
    enabled: isAdmin && !roleLoading,
  });

  // Grant admin role mutation
  const grantAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Insert admin role directly since RPC functions might not be available yet
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'Administrator' as AppRole });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Admin role granted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to grant admin role');
    },
  });

  // Revoke admin role mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'Administrator' as AppRole);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Admin role revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke admin role');
    },
  });

  const handleGrantAdmin = async (userId: string) => {
    if (window.confirm('Are you sure you want to grant admin privileges to this user?')) {
      grantAdminMutation.mutate(userId);
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    if (window.confirm('Are you sure you want to revoke admin privileges from this user?')) {
      revokeAdminMutation.mutate(userId);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to access the admin panel.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Grant Admin Access</Label>
            <div className="flex gap-2">
              <Input
                id="admin-email"
                type="email"
                placeholder="user@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <Button
                onClick={() => {
                  const user = users.find(u => u.email === newAdminEmail);
                  if (user) {
                    handleGrantAdmin(user.id);
                    setNewAdminEmail('');
                  } else {
                    toast.error('User not found');
                  }
                }}
                disabled={!newAdminEmail}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Grant
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">All Users</h3>
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name || user.email || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-1 flex gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={role.includes('Administrator') ? 'default' : 'secondary'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.roles.some(r => r === 'Administrator' || r === 'Super Administrator') ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeAdmin(user.id)}
                          disabled={revokeAdminMutation.isPending}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Revoke Admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantAdmin(user.id)}
                          disabled={grantAdminMutation.isPending}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
