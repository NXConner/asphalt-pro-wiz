# Row Level Security (RLS) Implementation

## Overview
This document describes the Row Level Security policies implemented for the Pavement Performance Suite application. RLS ensures that users can only access data they're authorized to see.

## Database Schema

### Core Tables

#### `profiles`
Stores user profile information.
- `id`: Primary key
- `user_id`: References `auth.users`, unique
- `display_name`: User's display name
- `avatar_url`: URL to user's avatar
- `created_at`, `updated_at`: Timestamps

**RLS Policies:**
- ✅ All users can view all profiles
- ✅ Users can only create their own profile
- ✅ Users can only update their own profile
- ✅ Users can only delete their own profile

#### `organizations`
Stores organization/company information.
- `id`: Primary key
- `name`: Organization name
- `created_at`, `updated_at`: Timestamps

**RLS Policies:**
- ✅ Users can only view organizations they're members of
- ✅ Any authenticated user can create an organization
- ✅ Only org admins/owners can update the organization

#### `user_org_memberships`
Manages user membership in organizations with roles.
- `id`: Primary key
- `user_id`: References `auth.users`
- `org_id`: References `organizations`
- `role`: User role (member, admin, owner)
- `created_at`: Timestamp

**RLS Policies:**
- ✅ Users can view their own memberships and memberships in orgs they admin
- ✅ Org admins can add new members
- ✅ Org admins can update member roles
- ✅ Org admins can remove members, users can leave organizations

### Storage Buckets

#### `avatars` (Public)
Stores user avatar images.

**Storage Policies:**
- ✅ Anyone can view avatar images
- ✅ Users can only upload to their own folder (`user_id/filename`)
- ✅ Users can only update their own avatars
- ✅ Users can only delete their own avatars

#### `documents` (Private)
Stores user documents and files.

**Storage Policies:**
- ✅ Users can only view their own documents
- ✅ Users can only upload to their own folder
- ✅ Users can only update their own documents
- ✅ Users can only delete their own documents

## Automatic Features

### Profile Creation
When a new user signs up, a profile is automatically created via the `handle_new_user()` trigger.

### Updated Timestamps
The `handle_updated_at()` trigger automatically updates the `updated_at` column on:
- `profiles`
- `organizations`

## Helper Functions

### `user_organizations()`
Returns all organization IDs that the current user is a member of.

**Usage:**
```sql
SELECT * FROM jobs WHERE org_id IN (SELECT org_id FROM user_organizations());
```

## Security Best Practices

### ✅ Implemented
1. **RLS Enabled**: All core tables have RLS enabled
2. **User Isolation**: Users can only access their own data or organization data
3. **Role-Based Access**: Admin/owner roles for organization management
4. **Storage Security**: File uploads restricted to user-specific folders
5. **Automatic Profile Creation**: Ensures all users have profiles
6. **Cascade Deletes**: User data is cleaned up when accounts are deleted

### 🔄 Future Enhancements
1. **Additional Tables**: Add RLS policies for:
   - `jobs` (if not using organization-based access)
   - `estimates`
   - `documents`
   - `receipts`
   - Any other user-specific tables

2. **Audit Logging**: Track who accesses what data
3. **Data Encryption**: Encrypt sensitive fields at rest
4. **Rate Limiting**: Prevent abuse of API endpoints
5. **IP Whitelisting**: Restrict access to specific IPs for admin operations

## Testing RLS Policies

### Test User Access
```sql
-- Set the current user context (in Supabase SQL Editor)
SELECT set_config('request.jwt.claims', '{"sub":"USER_UUID_HERE"}', TRUE);

-- Test if user can see their profile
SELECT * FROM profiles WHERE user_id = 'USER_UUID_HERE';

-- Test if user can see other profiles (should see all)
SELECT * FROM profiles;

-- Test organization access (should only see user's orgs)
SELECT * FROM organizations;
```

### Test Organization Membership
```sql
-- Create a test organization
INSERT INTO organizations (name) VALUES ('Test Org');

-- Add user to organization
INSERT INTO user_org_memberships (user_id, org_id, role)
VALUES ('USER_UUID_HERE', 'ORG_UUID_HERE', 'admin');

-- Verify user can see the organization
SELECT * FROM organizations WHERE id = 'ORG_UUID_HERE';
```

### Test Storage Policies
```typescript
// Upload avatar (should work)
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.jpg`, file);

// Try to upload to another user's folder (should fail)
const { error } = await supabase.storage
  .from('avatars')
  .upload(`different-user-id/avatar.jpg`, file);
```

## Common Issues & Solutions

### Issue: "new row violates row-level security policy"
**Cause**: Trying to insert data that doesn't match RLS policies.

**Solution**: Ensure you're setting the correct `user_id` or `org_id`:
```typescript
// ❌ Wrong - missing user_id
await supabase.from('profiles').insert({ display_name: 'John' });

// ✅ Correct - includes user_id
await supabase.from('profiles').insert({ 
  user_id: user.id, 
  display_name: 'John' 
});
```

### Issue: Can't see any data after enabling RLS
**Cause**: No policies exist for SELECT operations.

**Solution**: Policies have been created. Ensure you're authenticated:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // User needs to sign in first
}
```

### Issue: "permission denied for table"
**Cause**: RLS policies don't allow the operation.

**Solution**: Review the policies for the specific table and ensure:
1. User is authenticated
2. User has the correct role (admin/owner for certain operations)
3. User is accessing their own data or organization data

## Monitoring & Maintenance

### Check RLS Status
```sql
-- List all tables and their RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### View All Policies
```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Disable RLS (⚠️ Development Only)
```sql
-- NEVER do this in production!
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

## Migration Info
- **Created**: Phase 6 - Authentication & Security Setup
- **Migration ID**: Check latest migration in `supabase/migrations/`
- **Safe to re-run**: Yes (uses `IF NOT EXISTS`)

## Next Steps
1. ✅ RLS policies created and enabled
2. 📝 Test authentication flow with new users
3. 📝 Create organization and add members
4. 📝 Test data access across different users
5. 📝 Add RLS policies for additional application-specific tables (jobs, estimates, etc.)
6. 📝 Run security scan: `npm run db:linter`
