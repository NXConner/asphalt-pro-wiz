import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, Loader2, Shield, UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS, useIsAdmin } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import type { ProfileRow, RoleName, RoleRow, UserRoleRow } from '@/integrations/supabase/types';

interface UserWithRoles {
  id: string;
  email: string | null;
  full_name: string | null;
  roles: RoleName[];
}

const AVAILABLE_ROLE_ORDER: RoleName[] = ['viewer', 'operator', 'manager', 'super_admin'];

export function AdminPanel() {
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [emailLookup, setEmailLookup] = useState('');
  const queryClient = useQueryClient();

  const { data: availableRoles = [], isLoading: availableRolesLoading } = useQuery<RoleRow[]>({
    queryKey: ['roles-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('name, description, created_at');
      if (error) throw error;
      return data ?? [];
    },
    enabled: isAdmin && !roleLoading,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithRoles[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const [{ data: profiles, error: profileError }, { data: assignments, error: roleError }] =
        await Promise.all([
          supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', {
            ascending: false,
          }),
          supabase.from('user_roles').select('user_id, role_name'),
        ]);

      if (profileError) throw profileError;
      if (roleError) throw roleError;

      const assignmentMap = new Map<string, RoleName[]>();
      (assignments ?? []).forEach((row) => {
        const roleName = row.role_name as RoleName | null;
        if (!roleName) return;
        const current = assignmentMap.get(row.user_id) ?? [];
        if (!current.includes(roleName)) {
          current.push(roleName);
        }
        assignmentMap.set(row.user_id, current);
      });

      return (profiles ?? []).map<UserWithRoles>((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        roles: assignmentMap.get(profile.id) ?? [],
      }));
    },
    enabled: isAdmin && !roleLoading,
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName, enable }: { userId: string; roleName: RoleName; enable: boolean }) => {
      if (enable) {
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role_name: roleName } satisfies Partial<UserRoleRow>, {
            onConflict: 'user_id,role_name',
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role_name', roleName);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles', variables.userId] });
      toast.success(`${ROLE_LABELS[variables.roleName]} ${variables.enable ? 'granted' : 'revoked'}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update roles');
    },
  });

  const grantRoleByEmail = (roleName: RoleName, action: 'grant' | 'revoke') => {
    if (!emailLookup.trim()) return;
    const target = users.find((user) => user.email?.toLowerCase() === emailLookup.trim().toLowerCase());
    if (!target) {
      toast.error('User not found');
      return;
    }

    const enable = action === 'grant';
    const label = ROLE_LABELS[roleName];
    const confirmMessage = enable
      ? `Grant ${label} access to ${target.email || target.full_name}?`
      : `Revoke ${label} access from ${target.email || target.full_name}?`;

    if (window.confirm(confirmMessage)) {
      toggleRoleMutation.mutate({ userId: target.id, roleName, enable });
      setEmailLookup('');
    }
  };

  const superAdminRoleExists = useMemo(
    () => availableRoles.some((role) => role.name === 'super_admin'),
    [availableRoles],
  );

  if (roleLoading || availableRolesLoading) {
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
        <AlertDescription>You do not have permission to access the admin panel.</AlertDescription>
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
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {superAdminRoleExists && (
            <div className="space-y-2">
              <Label htmlFor="admin-email">Grant or revoke Super Admin</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="user@example.com"
                  value={emailLookup}
                  onChange={(e) => setEmailLookup(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => grantRoleByEmail('super_admin', 'grant')}
                  disabled={!emailLookup || toggleRoleMutation.isPending}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Grant
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => grantRoleByEmail('super_admin', 'revoke')}
                  disabled={!emailLookup || toggleRoleMutation.isPending}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Revoke
                </Button>
              </div>
            </div>
          )}

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
                  <div key={user.id} className="space-y-3 rounded-lg border p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{user.full_name || user.email || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline">No roles</Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={role} variant={role === 'super_admin' ? 'default' : 'secondary'}>
                              {ROLE_LABELS[role]}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_ROLE_ORDER.map((role) => {
                        const assigned = user.roles.includes(role);
                        return (
                          <Button
                            key={role}
                            type="button"
                            size="sm"
                            variant={assigned ? 'default' : 'outline'}
                            onClick={() =>
                              toggleRoleMutation.mutate({
                                userId: user.id,
                                roleName: role,
                                enable: !assigned,
                              })
                            }
                            disabled={toggleRoleMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            {assigned && <Check className="h-3.5 w-3.5" />}
                            {ROLE_LABELS[role]}
                          </Button>
                        );
                      })}
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

export default AdminPanel;
