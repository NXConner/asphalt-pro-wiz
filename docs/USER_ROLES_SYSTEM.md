# User Roles System

## Overview
The application implements a secure, scalable user roles system following security best practices to prevent privilege escalation attacks.

## Security Architecture

### Key Security Principles

1. **Separate Roles Table**: Roles are stored in a dedicated `user_roles` table, NOT on the profiles or users table
2. **Security Definer Functions**: Role checks use SECURITY DEFINER functions to prevent recursive RLS issues
3. **Server-Side Validation**: All role checks happen on the database side, never client-side
4. **Immutable Admin Protection**: Admins cannot remove their own admin role

### Why This Architecture?

**❌ NEVER DO THIS:**
```typescript
// Storing roles in localStorage - can be manipulated by attackers!
localStorage.setItem('isAdmin', 'true');

// Checking roles client-side - not secure!
const isAdmin = user.role === 'admin';

// Storing roles on the profile table - can lead to privilege escalation
```

**✅ CORRECT APPROACH:**
- Roles stored in separate `user_roles` table with RLS
- Role checks via security definer functions
- Server-side validation for all privileged operations

## Database Schema

### Tables

#### `user_roles`
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);
```

### Enums

#### `app_role`
```sql
CREATE TYPE public.app_role AS ENUM (
  'admin',      -- Full system access
  'moderator',  -- Content moderation and user management
  'user'        -- Standard user (default)
);
```

## Functions

### Role Checking Functions

#### `has_role(user_id, role)`
Checks if a specific user has a specific role.

```sql
SELECT public.has_role('user-uuid-here', 'admin');
-- Returns: true/false
```

#### `current_user_has_role(role)`
Checks if the current authenticated user has a specific role.

```sql
SELECT public.current_user_has_role('admin');
-- Returns: true/false
```

#### `get_user_roles(user_id)`
Returns all roles for a user.

```sql
SELECT * FROM public.get_user_roles('user-uuid-here');
-- Returns: ['user', 'admin']
```

### Admin Management Functions

#### `grant_admin_role(user_id)`
Grants admin role to a user. Only callable by existing admins.

```sql
SELECT public.grant_admin_role('user-uuid-here');
```

#### `revoke_admin_role(user_id)`
Revokes admin role from a user. Only callable by admins. Cannot self-revoke.

```sql
SELECT public.revoke_admin_role('user-uuid-here');
```

## Frontend Usage

### Hooks

#### `useUserRole()`
Hook to access user roles and check permissions.

```typescript
import { useUserRole } from '@/hooks/useUserRole';

function MyComponent() {
  const { roles, isAdmin, isModerator, hasRole, isLoading } = useUserRole();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isModerator && <ModeratorTools />}
      {hasRole('user') && <UserContent />}
    </div>
  );
}
```

#### `useIsAdmin()`
Simplified hook for checking admin status.

```typescript
import { useIsAdmin } from '@/hooks/useUserRole';

function AdminButton() {
  const { isAdmin, isLoading } = useIsAdmin();

  if (!isAdmin) return null;

  return <Button>Admin Action</Button>;
}
```

### Components

#### `AdminPanel`
Pre-built admin panel for managing user roles.

```typescript
import { AdminPanel } from '@/components/AdminPanel';

function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  );
}
```

## Role-Based Access Control (RBAC)

### Protecting Routes

```typescript
import { useIsAdmin } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return <LoadingSpinner />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
```

### Protecting Database Operations

Use RLS policies with role checks:

```sql
-- Example: Only admins can delete users
CREATE POLICY "admins_can_delete_users" ON public.profiles
  FOR DELETE
  USING (public.current_user_has_role('admin'));

-- Example: Moderators can update posts
CREATE POLICY "moderators_can_update_posts" ON public.posts
  FOR UPDATE
  USING (
    public.current_user_has_role('moderator') OR
    public.current_user_has_role('admin')
  );
```

### Protecting Edge Functions

```typescript
// In your edge function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(/* ... */);

// Check if user is admin
const { data: isAdmin } = await supabase
  .rpc('current_user_has_role', { _role: 'admin' });

if (!isAdmin) {
  return new Response('Unauthorized', { status: 403 });
}

// Proceed with admin operation...
```

## Default Roles

### Automatic Assignment

All new users automatically receive the `user` role upon signup via the `handle_new_user_role()` trigger.

### Creating the First Admin

**Option 1: Using Supabase SQL Editor**
```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Grant admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id-here', 'admin');
```

**Option 2: Using the Admin Panel**
1. Create the first admin manually using SQL (Option 1)
2. Sign in with that account
3. Use the Admin Panel UI to grant admin to other users

## Testing

### Test Role Assignment
```typescript
import { supabase } from '@/integrations/supabase/client';

// Get current user's roles
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

console.log('User roles:', roles);
```

### Test Role Functions
```sql
-- In Supabase SQL Editor
-- Set current user context
SELECT set_config('request.jwt.claims', '{"sub":"USER_UUID"}', TRUE);

-- Test role check
SELECT public.current_user_has_role('admin');

-- Get all roles
SELECT * FROM public.get_user_roles(auth.uid());
```

## Security Checklist

- ✅ Roles stored in separate table (not on profiles)
- ✅ RLS enabled on `user_roles` table
- ✅ Security definer functions for role checks
- ✅ Admin-only role management functions
- ✅ Self-revoke protection for admins
- ✅ Automatic default role assignment
- ✅ Server-side validation only (no client-side checks)
- ✅ Proper error handling and logging

## Common Issues

### Issue: "Only admins can grant admin role"
**Cause**: Trying to grant admin without having admin privileges.

**Solution**: Use SQL to create the first admin, then use the Admin Panel for subsequent grants.

### Issue: Can't see roles in frontend
**Cause**: RLS policies or permissions not configured correctly.

**Solution**: 
1. Ensure you're authenticated
2. Check that `user_roles` table has correct RLS policies
3. Verify `GRANT SELECT ON public.user_roles TO authenticated` was run

### Issue: Role checks always return false
**Cause**: Using client-side role checks or incorrect function calls.

**Solution**: Use the provided hooks (`useUserRole`, `useIsAdmin`) or RPC functions.

## Best Practices

1. **Never** store roles in localStorage or cookies
2. **Always** use server-side role validation for privileged operations
3. **Use** the security definer functions for consistent role checks
4. **Implement** audit logging for role changes (future enhancement)
5. **Review** role assignments regularly
6. **Test** with different user accounts and roles
7. **Document** which roles can access which features

## Future Enhancements

- [ ] Custom role types beyond admin/moderator/user
- [ ] Role expiration dates
- [ ] Role change audit trail
- [ ] Bulk role assignment
- [ ] Role-based feature flags
- [ ] Role templates for common permission sets
