# Deployment Guide

This guide covers deploying the Pavement Performance Suite application to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Options](#deployment-options)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

Before deploying to production, ensure all items are completed:

### Security
- ✅ All RLS policies are enabled and tested
- ✅ User roles system is configured
- ✅ Admin users are created
- ✅ Secrets are properly configured in Supabase
- ✅ CORS settings are configured
- ✅ Rate limiting is enabled (if applicable)

### Configuration
- ✅ Environment variables are set
- ✅ Supabase URL and keys are configured
- ✅ Site URL and redirect URLs are set in Supabase dashboard
- ✅ Email confirmation settings are configured
- ✅ Storage buckets are created with proper policies

### Testing
- ✅ All unit tests pass (`npm test`)
- ✅ E2E tests pass (`npm run test:e2e`)
- ✅ Authentication flow works correctly
- ✅ Protected routes redirect properly
- ✅ Admin panel functions correctly
- ✅ RLS policies prevent unauthorized access

### Performance
- ✅ Build completes without errors (`npm run build`)
- ✅ Bundle size is optimized
- ✅ Images are optimized
- ✅ Database indexes are created
- ✅ Query performance is acceptable

---

## Deployment Options

### Option 1: Deploy with Lovable (Recommended for Quick Start)

1. **Click the Publish Button**
   - Desktop: Top right of the editor
   - Mobile: Bottom-right corner in Preview mode

2. **Configure Domain**
   - Your app is accessible at `yoursite.lovable.app` by default
   - To use a custom domain, go to Project > Settings > Domains
   - Note: Custom domains require a paid Lovable plan

3. **Monitor Deployment**
   - Deployment typically takes 1-2 minutes
   - Check the deployment status in the Lovable dashboard

### Option 2: Deploy via GitHub + Vercel/Netlify

1. **Connect to GitHub**
   ```bash
   # In Lovable, click GitHub → Connect to GitHub
   # Select your account and create repository
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Or Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm i -g netlify-cli
   
   # Deploy
   netlify deploy --prod
   ```

### Option 3: Self-Hosted Deployment

1. **Build the Application**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy Build Directory**
   - Upload the `dist/` directory to your hosting provider
   - Configure your web server (nginx, Apache, etc.)
   - Ensure SPA routing is configured

3. **Example Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/app/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

---

## Environment Configuration

### Supabase Configuration (Required)

The application uses Supabase credentials that are embedded in the client code:

```typescript
// Already configured in src/integrations/supabase/client.ts
const SUPABASE_URL = "https://vodglzbgqsafghlihivy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGci..."; // Anon key (safe to expose)
```

**Important**: These credentials are already configured. The anon key is safe to expose publicly as it's protected by RLS policies.

### Supabase Dashboard Configuration

1. **Authentication Settings**
   - Go to: https://supabase.com/dashboard/project/vodglzbgqsafghlihivy/auth/url-configuration
   - Set **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
   - Add **Redirect URLs**:
     - `https://yourdomain.com/**`
     - `https://yourdomain.lovable.app/**`
     - `http://localhost:5173/**` (for development)

2. **Email Templates**
   - Configure email templates in Supabase Dashboard > Authentication > Email Templates
   - Customize confirmation and password reset emails

---

## Database Migration

### Initial Setup

1. **Verify Migrations**
   ```bash
   # All migrations are already applied
   # Check migration status in Supabase dashboard
   ```

2. **Create First Admin User**
   ```sql
   -- Run this in Supabase SQL Editor
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('your-user-id', 'Administrator')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

3. **Verify RLS Policies**
   - Check all tables have RLS enabled
   - Test policies with different user roles
   - Use the security scan tool if available

### Future Migrations

When adding new features that require database changes:

1. **Create Migration**
   ```bash
   # Migrations are managed through Lovable's database migration tool
   # Follow the prompts to create SQL migrations
   ```

2. **Test Migration**
   - Test in development environment first
   - Verify RLS policies work correctly
   - Check for breaking changes

3. **Apply to Production**
   - Migrations are automatically applied through Supabase
   - Monitor for errors in Supabase dashboard

---

## Post-Deployment Verification

### Automated Checks

Run these tests after deployment:

```bash
# Health check
curl https://yourdomain.com

# Authentication endpoint
curl https://yourdomain.com/auth

# API connectivity (should return 401 if not authenticated)
curl https://vodglzbgqsafghlihivy.supabase.co/rest/v1/jobs
```

### Manual Verification Checklist

1. **Authentication**
   - [ ] Sign up creates new user
   - [ ] Email confirmation works (if enabled)
   - [ ] Sign in works correctly
   - [ ] Sign out clears session
   - [ ] Protected routes redirect to login

2. **Authorization**
   - [ ] Regular users cannot access admin panel
   - [ ] Admin users can access admin panel
   - [ ] RLS policies prevent unauthorized data access
   - [ ] Users can only see their organization's data

3. **Core Features**
   - [ ] Jobs can be created
   - [ ] Estimates can be generated
   - [ ] Documents can be uploaded
   - [ ] Command Center displays analytics
   - [ ] Maps load correctly

4. **Performance**
   - [ ] Page load time < 3 seconds
   - [ ] Time to Interactive < 5 seconds
   - [ ] No console errors
   - [ ] Database queries are fast

---

## Rollback Procedures

### Using Lovable Version History

1. **Access Version History**
   - Click the clock icon in Lovable editor
   - Browse previous versions
   - Click "Restore" on a working version

2. **Redeploy**
   - Click Publish button again
   - Monitor deployment

### Using Git/GitHub

1. **Identify Last Working Commit**
   ```bash
   git log --oneline
   ```

2. **Revert to Previous Version**
   ```bash
   # Option 1: Create new commit that undoes changes
   git revert <commit-hash>
   git push
   
   # Option 2: Hard reset (use with caution)
   git reset --hard <commit-hash>
   git push --force
   ```

3. **Redeploy**
   - Push triggers automatic deployment (if configured)
   - Or manually deploy using your hosting provider's CLI

### Database Rollback

**Warning**: Database rollbacks are complex and risky. Avoid if possible.

1. **Backup First**
   ```bash
   # Supabase automatically creates backups
   # Access in Supabase Dashboard > Database > Backups
   ```

2. **Restore from Backup**
   - Go to Supabase Dashboard
   - Navigate to Database > Backups
   - Select backup point
   - Click "Restore"

3. **Verify Data Integrity**
   - Check critical tables
   - Verify RLS policies still work
   - Test authentication flow

---

## Monitoring and Maintenance

### Application Monitoring

1. **Supabase Dashboard**
   - Monitor database performance
   - Check authentication logs
   - Review API usage

2. **Browser Console**
   - Monitor for JavaScript errors
   - Check network requests
   - Review performance metrics

### Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Performance optimization

---

## Troubleshooting

### Common Deployment Issues

**Issue**: Authentication redirects fail
- **Solution**: Check Site URL and Redirect URLs in Supabase dashboard

**Issue**: "Invalid credentials" error
- **Solution**: Verify Supabase keys are correct

**Issue**: 404 errors on page refresh
- **Solution**: Configure SPA routing on your hosting provider

**Issue**: RLS policy errors
- **Solution**: Review and test RLS policies in Supabase SQL editor

### Getting Help

- **Lovable Documentation**: https://docs.lovable.dev/
- **Supabase Documentation**: https://supabase.com/docs
- **Project Documentation**: See docs/ folder
- **Lovable Discord**: https://discord.com/channels/1119885301872070706

---

## Related Documentation

- [Authentication Setup](./AUTHENTICATION_SETUP.md)
- [RLS Security](./RLS_SECURITY.md)
- [User Roles System](./USER_ROLES_SYSTEM.md)
- [Application RLS Policies](./APPLICATION_RLS_POLICIES.md)
