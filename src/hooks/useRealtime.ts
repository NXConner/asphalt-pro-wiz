import type { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { supabase } from '@/integrations/supabase/client';

interface RealtimeOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  invalidateQueries?: string[][];
}

/**
 * Hook to subscribe to realtime changes in Supabase
 */
export function useRealtime({
  table,
  event = '*',
  schema = 'public',
  filter,
  invalidateQueries,
}: RealtimeOptions) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase.channel(`${table}_realtime`);

      const config: any = {
        event,
        schema,
        table,
      };

      if (filter) {
        config.filter = filter;
      }

      channel
        .on('postgres_changes', config, (payload) => {
          console.log('Realtime update:', payload);

          // Invalidate relevant queries when data changes
          if (invalidateQueries) {
            invalidateQueries.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: key });
            });
          }
        })
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [table, event, schema, filter, queryClient, invalidateQueries]);

  return { isConnected };
}
