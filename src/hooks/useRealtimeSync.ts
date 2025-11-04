import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSyncOptions {
  table: string;
  queryKey: string[];
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  showToast?: boolean;
}

export function useRealtimeSync({
  table,
  queryKey,
  onInsert,
  onUpdate,
  onDelete,
  showToast = false,
}: RealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_sync`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey });
          onInsert?.(payload);
          if (showToast) {
            toast({
              title: 'New item added',
              description: `A new ${table.slice(0, -1)} was created`,
            });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey });
          onUpdate?.(payload);
          if (showToast) {
            toast({
              title: 'Item updated',
              description: `A ${table.slice(0, -1)} was updated`,
            });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey });
          onDelete?.(payload);
          if (showToast) {
            toast({
              title: 'Item deleted',
              description: `A ${table.slice(0, -1)} was deleted`,
              variant: 'destructive',
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryKey, onInsert, onUpdate, onDelete, showToast, queryClient, toast]);
}
