# Security Remediation Guide

This guide provides step-by-step instructions for completing the security hardening process.

## ✅ Completed Fixes

The following critical security issues have been **automatically fixed** by the migration:

### 1. RLS Policy Vulnerabilities ✅
- **Mapmeasurements**: Restricted to organization members only (was public read/write)
- **ai_site_analysis**: Fixed hardcoded 'demo-user' bypass, now uses auth.uid()
- **alerts**: Added validation for employee/vehicle ownership

### 2. Admin Trigger Security ✅
- **Removed hardcoded admin email** from `handle_new_user_role()` function
- **Fixed search_path** from `'public'` to `''` (empty string) for maximum security
- **Added audit logging** for all role assignments/revocations
- **Created secure functions**: `grant_admin_role_secure()` and `revoke_admin_role_secure()`

### 3. Secrets Cleanup ✅
- **Cleaned .env file** of sensitive credentials (replaced with placeholders)
- **Added security warnings** to prevent accidental commits
- **Documented safe vs. unsafe environment variables**

## 🔄 Manual Steps Required

### Step 1: Rotate Exposed Credentials (CRITICAL - Do Later)

**Important**: The user requested NOT to rotate credentials yet. When ready to rotate:

1. **Database Password**:
   ```bash
   # In Supabase Dashboard > Database > Settings
   # Click "Reset database password"
   # Update DATABASE_URL in Supabase Secrets
   ```

2. **Google Maps API Key**:
   - Visit: https://console.cloud.google.com/apis/credentials
   - Delete: `AIzaSyCu52...` (exposed key)
   - Create new key with HTTP referrer restrictions
   - Add to Supabase Secrets as `VITE_GOOGLE_MAPS_API_KEY`

3. **Gemini API Key**:
   - Visit: https://aistudio.google.com/app/apikey
   - Delete: `AIzaSyBECTAY...` (exposed key)
   - Create new key
   - Add to Supabase Secrets as `GEMINI_API_KEY`

4. **OpenWeather API Key**:
   - Visit: https://home.openweathermap.org/api_keys
   - Delete: `fcd180ffa1f...` (exposed key)
   - Generate new key
   - Add to Supabase Secrets as `VITE_OPENWEATHER_API_KEY`

5. **Mapbox Token**:
   - Visit: https://account.mapbox.com/access-tokens
   - Revoke: `pk.eyJ1Ijoib...` (exposed token)
   - Create new token with URL restrictions
   - Add to Supabase Secrets as `VITE_MAPBOX_TOKEN`

### Step 2: Add Secrets to Supabase

Add the following secrets in **Supabase Dashboard > Project Settings > Edge Functions**:

```bash
# Required secrets for edge functions
GEMINI_API_KEY=<your-new-gemini-key>
VITE_GOOGLE_MAPS_API_KEY=<your-new-maps-key>
VITE_OPENWEATHER_API_KEY=<your-new-openweather-key>
VITE_MAPBOX_TOKEN=<your-new-mapbox-token>

# Optional: Database admin credentials (if needed for migrations)
DATABASE_URL=<your-new-database-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Step 3: Enable Supabase Hardening

#### 3.1 Enable Leaked Password Protection
1. Go to: **Supabase Dashboard > Authentication > Settings**
2. Enable: **"Leaked Password Protection"**
3. This prevents users from using passwords found in data breaches

#### 3.2 Upgrade Postgres Version
1. Go to: **Supabase Dashboard > Database > Settings**
2. Check for available Postgres upgrades
3. Schedule upgrade during low-traffic window
4. Follow: https://supabase.com/docs/guides/platform/upgrading

#### 3.3 Review Database Linter Warnings
Run the linter to check for remaining issues:
```bash
# In Supabase Dashboard > Database > Linter
# Or via CLI:
supabase db lint
```

Address any remaining warnings:
- **Security Definer Views**: Review and restrict as needed
- **Extension in Public**: Consider moving to `extensions` schema
- **Function Search Path**: Already fixed in migration

### Step 4: Remove Secrets from Git History

**Important**: Even though `.env` is now cleaned, git history may contain old secrets.

```bash
# Option 1: Use BFG Repo-Cleaner (recommended)
brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/
bfg --replace-text passwords.txt  # Create passwords.txt with old secrets
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: Use git-filter-repo
pip install git-filter-repo
git filter-repo --path .env --invert-paths

# Option 3: For small repos, consider fresh start
# Create new repo, copy only necessary files, commit clean history
```

### Step 5: Create First Super Administrator

Since hardcoded admin email was removed, manually create the first admin:

```sql
-- In Supabase SQL Editor, after first user signs up
-- Replace <user-id> with the UUID of your admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-id>', 'Super Administrator');

-- Or use the secure function (once you're already an admin)
SELECT public.grant_admin_role_secure(
  '<target-user-id>'::uuid,
  'Super Administrator',
  'Initial admin setup'
);
```

### Step 6: API Key Restrictions

For client-side API keys, enable provider restrictions:

#### Google Maps API Key
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers"
   - Add: `https://yourdomain.com/*`
   - Add: `http://localhost:8080/*` (for development)

#### Mapbox Token
1. Visit: https://account.mapbox.com/access-tokens
2. Select your token
3. Under "URL restrictions":
   - Add: `https://yourdomain.com`
   - Add: `http://localhost:8080` (for development)

## 🔍 Verification Steps

After completing manual steps, verify the fixes:

### 1. Test RLS Policies
```sql
-- As regular user, try to access another org's data
SELECT * FROM "Mapmeasurements" WHERE job_id = '<other-org-job-id>';
-- Should return empty (access denied)

-- Try to insert without proper org membership
INSERT INTO "Mapmeasurements" (job_id, geojson) VALUES ('<other-org-job-id>', '{}');
-- Should fail with RLS policy violation
```

### 2. Test Admin Role Assignment
```sql
-- Try to grant admin without being admin
SELECT public.grant_admin_role_secure('<user-id>'::uuid, 'Administrator', 'Test');
-- Should fail with "Only Super Administrators can grant admin roles"

-- As Super Admin, grant admin role
SELECT public.grant_admin_role_secure('<user-id>'::uuid, 'Administrator', 'Legitimate reason');
-- Should succeed and create audit log entry

-- Verify audit log
SELECT * FROM public.role_audit_log ORDER BY performed_at DESC LIMIT 10;
```

### 3. Test Secrets Migration
```bash
# Edge function should work with Supabase Secrets
curl -X POST https://vodglzbgqsafghlihivy.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"action":"chat","content":"Hello"}'
# Should return AI response (proves GEMINI_API_KEY is working from secrets)
```

### 4. Run Security Scan
```bash
# Supabase Linter
supabase db lint

# Check for remaining exposed secrets
git secrets --scan
# Or manually search: grep -r "AIza" .
```

## 📊 Security Improvements Summary

| Issue | Before | After | Status |
|-------|--------|-------|--------|
| Mapmeasurements RLS | Public read/write | Org-scoped only | ✅ Fixed |
| ai_site_analysis RLS | Hardcoded 'demo-user' | Auth-based | ✅ Fixed |
| alerts RLS | No validation | Ownership validated | ✅ Fixed |
| Admin email | Hardcoded | Role-based system | ✅ Fixed |
| handle_new_user_role | Weak search_path | Secure search_path | ✅ Fixed |
| .env secrets | Exposed credentials | Cleaned (placeholders) | ✅ Fixed |
| Audit logging | None | Full audit trail | ✅ Added |
| Password protection | Disabled | Manual enable needed | ⏳ Pending |
| Postgres version | Outdated | Manual upgrade needed | ⏳ Pending |

## 🎯 Next Steps

1. **Review migration results** in Supabase Dashboard
2. **When ready to rotate**, follow Step 1 credential rotation
3. **Enable Supabase hardening** (Step 3)
4. **Clean git history** if repo is shared (Step 4)
5. **Create first Super Admin** (Step 5)
6. **Add API restrictions** (Step 6)
7. **Run verification tests** (Verification section)

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Secrets Management](https://supabase.com/docs/guides/functions/secrets)
- [Database Security Best Practices](https://supabase.com/docs/guides/database/database-linter)
- [Git Secrets Removal Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

## ⚠️ Important Notes

- **DO NOT** commit real secrets to `.env` file
- **ALWAYS** use Supabase Secrets for sensitive credentials
- **ROTATE** credentials immediately when exposed
- **MONITOR** role_audit_log for suspicious activity
- **TEST** RLS policies thoroughly before deploying to production
