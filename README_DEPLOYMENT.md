# Deployment Guide

## Pre-deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Security audit completed
- [ ] Documentation updated

## Environment Variables

Create `.env.production` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_api_url
VITE_GA_ID=your_google_analytics_id
```

## Build for Production

```bash
# Install dependencies
npm ci

# Run tests
npm run test

# Build application
npm run build

# Preview build locally
npm run preview
```

## Deployment Platforms

### Vercel

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

```bash
# Deploy with Vercel CLI
npm install -g vercel
vercel --prod
```

### Netlify

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Add environment variables
4. Deploy

```bash
# Deploy with Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Docker

```bash
# Build Docker image
docker build -t asphalt-overwatch .

# Run container
docker run -p 8080:80 asphalt-overwatch

# Push to registry
docker tag asphalt-overwatch registry.example.com/asphalt-overwatch
docker push registry.example.com/asphalt-overwatch
```

### Self-hosted with Nginx

1. Build application: `npm run build`
2. Copy `dist` folder to server
3. Configure Nginx:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/asphalt-overwatch/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. Restart Nginx: `sudo systemctl restart nginx`

## Supabase Production Setup

### Database

1. Apply all migrations:
```bash
supabase db push --db-url your_production_db_url
```

2. Enable Row Level Security on all tables

3. Create indexes for performance:
```sql
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

### Storage

1. Create buckets for file uploads
2. Configure storage policies
3. Set up CDN for static assets

### Edge Functions

```bash
# Deploy edge functions
supabase functions deploy function_name
```

### Auth

1. Configure email templates
2. Set up OAuth providers (if needed)
3. Configure redirect URLs
4. Set session timeout

## Monitoring

### Performance Monitoring

- Enable Web Vitals tracking
- Set up performance alerts
- Monitor Core Web Vitals (LCP, FID, CLS)

### Error Tracking

Integrate error tracking service:

```typescript
// Add to main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your_sentry_dsn',
  environment: 'production',
  tracesSampleRate: 1.0,
});
```

### Analytics

- Google Analytics configured
- Custom events tracked
- Conversion goals set up

## Security

### HTTPS

- Enable SSL certificate (Let's Encrypt)
- Force HTTPS redirect
- Enable HSTS headers

### Headers

Add security headers in Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;" always;
```

### API Keys

- Never commit API keys to repository
- Use environment variables
- Rotate keys regularly
- Use key management service (AWS Secrets Manager, etc.)

## Post-deployment

1. **Smoke Testing**
   - Test critical user flows
   - Verify authentication works
   - Check database connections
   - Test file uploads

2. **Performance Check**
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Monitor initial load time
   - Verify caching works

3. **Monitoring Setup**
   - Verify error tracking
   - Check analytics data
   - Set up uptime monitoring
   - Configure alerts

4. **Documentation**
   - Update changelog
   - Document new features
   - Update API documentation
   - Notify stakeholders

## Rollback Plan

If deployment fails:

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Docker
docker pull registry.example.com/asphalt-overwatch:previous-tag
docker run -d -p 8080:80 registry.example.com/asphalt-overwatch:previous-tag

# Database rollback
supabase db reset --version previous_migration_timestamp
```

## CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```
