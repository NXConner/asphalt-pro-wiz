# Real-time Features Guide

## Overview

The application includes comprehensive real-time features powered by Supabase Realtime, enabling live collaboration and instant updates across users.

## Enabled Tables

The following tables have real-time updates enabled:

- `jobs` - Live job updates
- `work_schedules` - Schedule changes
- `estimates` - Estimate modifications
- `clients` - Client information updates
- `notifications` - Real-time notifications

## Features

### 1. Real-time Notifications

**Component**: `RealtimeNotifications`

Displays live notifications with:
- Toast notifications for new events
- Unread count badge
- Mark as read functionality
- Notification history

**Usage**:
```tsx
import { RealtimeNotifications } from '@/components/RealtimeNotifications';

<RealtimeNotifications />
```

### 2. User Presence

**Component**: `UserPresence`

Shows online users in real-time:
- Avatar display of active users
- Online count badge
- Join/leave notifications

**Usage**:
```tsx
import { UserPresence } from '@/components/UserPresence';

<UserPresence />
```

### 3. Real-time Data Sync

**Hook**: `useRealtimeSync`

Automatically syncs data changes across all clients:

```tsx
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

useRealtimeSync({
  table: 'jobs',
  queryKey: ['jobs'],
  showToast: true,
  onInsert: (payload) => console.log('New job:', payload),
  onUpdate: (payload) => console.log('Job updated:', payload),
  onDelete: (payload) => console.log('Job deleted:', payload),
});
```

## Implementation Examples

### Basic Real-time Subscription

```tsx
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

useEffect(() => {
  const channel = supabase
    .channel('my_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'jobs'
      },
      (payload) => {
        console.log('Change received!', payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Presence Tracking

```tsx
const channel = supabase.channel('room_01');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Current users:', state);
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: 'user-1',
        online_at: new Date().toISOString(),
      });
    }
  });
```

## Best Practices

1. **Clean Up Subscriptions**: Always unsubscribe from channels in cleanup functions
2. **Filter Events**: Use specific event types when possible to reduce bandwidth
3. **Batch Updates**: Use `queryClient.invalidateQueries()` to batch UI updates
4. **Error Handling**: Implement reconnection logic for network interruptions
5. **Rate Limiting**: Be mindful of subscription limits in production

## Performance Considerations

- Supabase Realtime has connection limits per project
- Use channel multiplexing for multiple subscriptions
- Consider implementing debouncing for high-frequency updates
- Monitor connection status and provide feedback to users

## Troubleshooting

### Connections Not Working

1. Verify table has `REPLICA IDENTITY FULL` set
2. Check table is in `supabase_realtime` publication
3. Verify RLS policies allow subscriptions
4. Check network connectivity

### Missing Updates

1. Ensure channel subscription completed successfully
2. Verify event filters match database events
3. Check browser console for errors
4. Validate user has proper permissions

## Security

Real-time subscriptions respect Row Level Security (RLS) policies:
- Users only receive updates for rows they can SELECT
- Ensure RLS policies are properly configured
- Test with different user roles

## Further Reading

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Real-time Presence Guide](https://supabase.com/docs/guides/realtime/presence)
- [Broadcast Messages](https://supabase.com/docs/guides/realtime/broadcast)
