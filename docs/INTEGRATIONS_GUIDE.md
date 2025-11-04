# Integrations Guide

## Overview

This guide covers how to integrate third-party services and build custom integrations with the Pavement Performance Suite.

## Webhook System

### Overview

The webhook system allows external services to receive real-time notifications when events occur in the application.

### Creating Webhooks

Webhooks can be managed through the Admin Panel by users with admin privileges.

**Required Fields**:
- Name: Descriptive name for the webhook
- URL: Endpoint to receive webhook events
- Events: List of tables to monitor (jobs, estimates, clients, etc.)
- Secret: Optional secret for request signing

### Webhook Events

Events are triggered when records are inserted, updated, or deleted:

```json
{
  "event": "INSERT",
  "table": "jobs",
  "data": {
    "id": "uuid",
    "name": "New Job",
    "status": "pending",
    ...
  },
  "old_data": null,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Webhook Security

1. **Request Signing**: Webhooks can be signed with a secret
2. **HTTPS Only**: Only HTTPS endpoints accepted
3. **IP Allowlisting**: Configure allowed IPs in Supabase
4. **Rate Limiting**: Automatic rate limiting applied

### Example Webhook Handler

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return signature === digest;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  if (verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    // Process webhook
    console.log('Event received:', payload.event);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});
```

## API Integration

### REST API

Access data via Supabase REST API:

```javascript
// Get jobs
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'pending');

// Create job
const { data, error } = await supabase
  .from('jobs')
  .insert([
    { name: 'New Job', status: 'pending' }
  ]);
```

### Authentication

Use JWT tokens for API authentication:

```javascript
const token = 'your_jwt_token';

fetch('https://your-project.supabase.co/rest/v1/jobs', {
  headers: {
    'apikey': 'your_anon_key',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

## Third-Party Integrations

### Google Maps Integration

Already integrated. Customize in `src/lib/mapSettings.ts`:

```typescript
export const mapSettings = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  defaultCenter: { lat: 40.7128, lng: -74.0060 },
  defaultZoom: 12,
};
```

### Weather Integration

OpenWeather API integration available. Configure in edge function:

```typescript
const WEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
```

### Email Service

Integrate email services (SendGrid, Mailgun, etc.) via edge functions:

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { to, subject, body } = await req.json();
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@example.com' },
      subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });
  
  return new Response(JSON.stringify({ success: response.ok }));
});
```

### SMS Integration

Add Twilio for SMS notifications:

```typescript
// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { to, message } = await req.json();
  
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_PHONE_NUMBER');
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: message,
      }),
    }
  );
  
  return new Response(JSON.stringify({ success: response.ok }));
});
```

## Custom Integration Development

### Creating Custom Connectors

1. **Create Edge Function**:
```bash
supabase functions new my-integration
```

2. **Implement Connector Logic**:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
  
  // Your integration logic here
  
  return new Response(JSON.stringify({ success: true }));
});
```

3. **Deploy**:
```bash
supabase functions deploy my-integration
```

### Integration Best Practices

1. **Error Handling**: Implement comprehensive error handling
2. **Retries**: Add exponential backoff for failures
3. **Logging**: Use structured logging for debugging
4. **Rate Limiting**: Respect third-party API limits
5. **Secrets**: Store API keys securely in Supabase secrets
6. **Testing**: Test integrations thoroughly before deployment

## OAuth Integration

### Example: Google OAuth

1. **Configure Provider** in Supabase Dashboard
2. **Implement Sign-in**:

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'email profile',
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

## Monitoring Integrations

### Logging

View integration logs in Supabase Dashboard:
- Edge Function logs
- Database logs
- Realtime logs

### Analytics

Track integration usage:
```typescript
await supabase
  .from('integration_logs')
  .insert([
    {
      integration: 'my-service',
      event: 'api_call',
      success: true,
      duration_ms: 120,
    }
  ]);
```

## Common Integration Patterns

### Polling Pattern

For services without webhooks:

```typescript
// Run every hour
cron.schedule('0 * * * *', async () => {
  const data = await fetchExternalData();
  await syncToDatabase(data);
});
```

### Event-Driven Pattern

React to database changes:

```typescript
supabase
  .channel('changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'jobs' },
    async (payload) => {
      await notifyExternalService(payload);
    }
  )
  .subscribe();
```

## Support

For integration assistance:
- Review [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- Check [API Reference](./API_REFERENCE.md)
- Contact support team
