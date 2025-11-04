# Application-Specific RLS Policies

## Overview
This document describes the Row Level Security policies for application-specific tables: jobs, estimates, documents, receipts, and AI-related tables.

## Access Control Model

### Organization-Based Access
Most tables use **organization-based access control**:
- Users access data through their `user_org_memberships`
- All members of an organization can view and modify organization data
- Organization admins have additional delete permissions

### User-Owned Access
Some tables use **user-owned access control**:
- Users can only access their own records
- Used for AI estimates and AI site analyses

## RLS Policies by Table

### Jobs Table

**Access Pattern**: Organization-based

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_org_jobs` | All org members |
| INSERT | `users_can_create_org_jobs` | All org members |
| UPDATE | `users_can_update_org_jobs` | All org members |
| DELETE | `admins_can_delete_org_jobs` | Org admins + System admins |

**Usage Example:**
```typescript
// Get all jobs for user's organizations
const { data: jobs } = await supabase
  .from('jobs')
  .select('*');

// Create a new job (must include org_id)
const { data, error } = await supabase
  .from('jobs')
  .insert({
    org_id: userOrgId,
    name: 'New Job',
    // ... other fields
  });
```

### Estimates Table

**Access Pattern**: Organization-based (through jobs relationship)

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_org_estimates` | All org members (via job) |
| INSERT | `users_can_create_org_estimates` | All org members (via job) |
| UPDATE | `users_can_update_org_estimates` | All org members (via job) |
| DELETE | `admins_can_delete_org_estimates` | Org admins + System admins |

**Note**: Estimates inherit organization access through their associated job.

**Usage Example:**
```typescript
// Get estimates for jobs in user's org
const { data: estimates } = await supabase
  .from('estimates')
  .select('*, jobs(*)');

// Create estimate (job_id must be in user's org)
const { data, error } = await supabase
  .from('estimates')
  .insert({
    job_id: jobId,
    total_cost: 5000,
    // ... other fields
  });
```

### Documents Table

**Access Pattern**: Organization-based with user ownership

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_org_documents` | All org members |
| INSERT | `users_can_create_org_documents` | All org members |
| UPDATE | `users_can_update_own_documents` | Document owner OR org admin |
| DELETE | `users_can_delete_own_documents` | Document owner OR org admin |

**Usage Example:**
```typescript
// View all org documents
const { data: docs } = await supabase
  .from('documents')
  .select('*');

// Create document (must include org_id and user_id)
const { data, error } = await supabase
  .from('documents')
  .insert({
    org_id: userOrgId,
    user_id: user.id,
    name: 'Contract.pdf',
    url: fileUrl,
  });

// Update document (only if owner or admin)
const { error } = await supabase
  .from('documents')
  .update({ name: 'Updated Name' })
  .eq('id', docId);
```

### Receipts Table

**Access Pattern**: Organization-based with user ownership

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_org_receipts` | All org members |
| INSERT | `users_can_create_org_receipts` | All org members |
| UPDATE | `users_can_update_own_receipts` | Receipt owner OR org admin |
| DELETE | `users_can_delete_own_receipts` | Receipt owner OR org admin |

**Usage Example:**
```typescript
// View all org receipts
const { data: receipts } = await supabase
  .from('receipts')
  .select('*');

// Create receipt
const { data, error } = await supabase
  .from('receipts')
  .insert({
    org_id: userOrgId,
    user_id: user.id,
    amount: 250.00,
    vendor: 'Acme Supplies',
  });
```

### AI Estimates Table

**Access Pattern**: User-owned

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_own_ai_estimates` | Owner only |
| INSERT | `users_can_create_own_ai_estimates` | Owner only |
| UPDATE | `users_can_update_own_ai_estimates` | Owner only |
| DELETE | `users_can_delete_own_ai_estimates` | Owner only |

**Usage Example:**
```typescript
// Get user's AI estimates
const { data } = await supabase
  .from('ai_estimates')
  .select('*');

// Create AI estimate (user_id must be current user)
const { data, error } = await supabase
  .from('ai_estimates')
  .insert({
    user_id: user.id,
    scope: 'Parking lot sealcoating',
    total: 3500,
  });
```

### AI Site Analysis Table

**Access Pattern**: User-owned

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | `users_can_view_own_analyses` | Owner only |
| INSERT | `users_can_create_own_analyses` | Owner only |
| UPDATE | `users_can_update_own_analyses` | Owner only |
| DELETE | `users_can_delete_own_analyses` | Owner only |

## System Administrator Override

**Super Administrators** have read access to all records in all tables:
- Can view jobs, estimates, documents, and receipts across all organizations
- Useful for system maintenance and support
- Does not grant write/update/delete access (intentionally limited)

## Helper Views

### `user_accessible_jobs`
Simplified view showing all jobs accessible to the current user.

```sql
SELECT * FROM public.user_accessible_jobs;
```

### `user_accessible_estimates`
Simplified view showing all estimates accessible to the current user.

```sql
SELECT * FROM public.user_accessible_estimates;
```

**Usage in Code:**
```typescript
// Using the helper view (simpler query)
const { data: jobs } = await supabase
  .from('user_accessible_jobs')
  .select('*');

// Equivalent to querying jobs with RLS (more complex)
const { data: jobs2 } = await supabase
  .from('jobs')
  .select('*, user_org_memberships!inner(org_id)');
```

## Common Patterns

### Creating Records with Organization Context

```typescript
// Always include org_id when creating organization-scoped records
const createJob = async (name: string, orgId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      name,
      org_id: orgId,
      created_by: user.id,
    })
    .select()
    .single();

  return { data, error };
};
```

### Creating Records with User Ownership

```typescript
// Always include user_id for user-owned records
const createDocument = async (name: string, url: string, orgId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      name,
      url,
      org_id: orgId,
      user_id: user.id,  // Important!
    })
    .select()
    .single();

  return { data, error };
};
```

### Checking Organization Membership

```typescript
// Get user's organizations
const { data: memberships } = await supabase
  .from('user_org_memberships')
  .select('org_id, role, organizations(name)')
  .eq('user_id', user.id);

// Check if user is in an organization
const isInOrg = memberships.some(m => m.org_id === targetOrgId);

// Check if user is org admin
const isOrgAdmin = memberships.some(
  m => m.org_id === targetOrgId && ['admin', 'owner'].includes(m.role)
);
```

## Testing RLS Policies

### Test Organization Access

```sql
-- Set user context
SELECT set_config('request.jwt.claims', '{\\\"sub\\\":\\\"USER_UUID\\\"}', TRUE);

-- Test job access (should only see jobs in user's orgs)
SELECT * FROM jobs;

-- Test estimate access (should only see estimates for user's jobs)
SELECT * FROM estimates;

-- Verify organization membership
SELECT * FROM user_org_memberships WHERE user_id = 'USER_UUID';
```

### Test User-Owned Access

```sql
-- Test AI estimates (should only see own)
SELECT * FROM ai_estimates WHERE user_id = 'USER_UUID';

-- Try to access another user's estimates (should be empty)
SELECT * FROM ai_estimates WHERE user_id != 'USER_UUID';
```

### Test Admin Access

```sql
-- Test org admin can delete
DELETE FROM jobs WHERE id = 'JOB_UUID';

-- Test system admin can view all
SELECT * FROM jobs; -- Should see all jobs if Super Administrator
```

## Common Issues & Solutions

### Issue: "new row violates row-level security policy"

**Cause**: Missing required fields for RLS checks.

**Solutions:**

1. **For organization-based tables**: Include `org_id`
```typescript
// ❌ Wrong
await supabase.from('jobs').insert({ name: 'Job' });

// ✅ Correct
await supabase.from('jobs').insert({ 
  name: 'Job', 
  org_id: userOrgId 
});
```

2. **For user-owned tables**: Include `user_id`
```typescript
// ❌ Wrong
await supabase.from('documents').insert({ 
  name: 'Doc',
  org_id: orgId 
});

// ✅ Correct
await supabase.from('documents').insert({ 
  name: 'Doc',
  org_id: orgId,
  user_id: user.id 
});
```

### Issue: Can't see any data after adding to organization

**Cause**: User might not have proper organization membership.

**Solution**: Verify membership exists
```sql
-- Check if user is in organization
SELECT * FROM user_org_memberships 
WHERE user_id = 'USER_UUID' AND org_id = 'ORG_UUID';

-- If not, add them
INSERT INTO user_org_memberships (user_id, org_id, role)
VALUES ('USER_UUID', 'ORG_UUID', 'member');
```

### Issue: Can't delete records as regular user

**Cause**: Delete operations often require admin role.

**Solution**: Check if user has admin role in organization
```typescript
const { data: membership } = await supabase
  .from('user_org_memberships')
  .select('role')
  .eq('user_id', user.id)
  .eq('org_id', orgId)
  .single();

const canDelete = ['admin', 'owner'].includes(membership?.role);
```

## Security Best Practices

1. **Always validate organization membership** before allowing operations
2. **Never trust client-side org_id** - validate server-side
3. **Use triggers** to automatically set `user_id` and `org_id` where possible
4. **Log sensitive operations** (deletions, role changes)
5. **Regularly audit** organization memberships
6. **Test with different user accounts** to verify isolation
7. **Monitor failed RLS checks** in Supabase logs

## Performance Considerations

### Indexing

The policies rely on these indexes for performance:
```sql
-- Existing indexes (verify these exist)
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_estimates_job_id ON estimates(job_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_org_id ON receipts(org_id);
CREATE INDEX IF NOT EXISTS idx_user_org_memberships_user_id ON user_org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_org_memberships_org_id ON user_org_memberships(org_id);
```

### Query Optimization

Use helper views for simpler queries:
```typescript
// Slower: Complex join
const { data } = await supabase
  .from('jobs')
  .select('*, user_org_memberships!inner(*)');

// Faster: Use helper view
const { data } = await supabase
  .from('user_accessible_jobs')
  .select('*');
```

## Next Steps

1. ✅ RLS policies implemented for all core tables
2. 📝 Test policies with different user accounts
3. 📝 Create custom indexes if query performance is slow
4. 📝 Add audit logging for sensitive operations
5. 📝 Document organization setup process for new users
6. 📝 Create admin UI for managing organization memberships
