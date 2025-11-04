import type { PostgrestError } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

interface QueryOptions<T> {
  queryKey: string[];
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}

export function useSupabaseQuery<T>({
  queryKey,
  table,
  select = '*',
  filters,
  orderBy,
  limit,
  enabled = true,
}: QueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table as any).select(select);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value) as any;
        });
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true }) as any;
      }

      if (limit) {
        query = query.limit(limit) as any;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as T[];
    },
    enabled,
  });
}

interface MutationOptions {
  table: string;
  invalidateQueries?: string[][];
  successMessage?: string;
}

export function useSupabaseInsert<T>({
  table,
  invalidateQueries,
  successMessage,
}: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<T>) => {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      if (invalidateQueries) {
        invalidateQueries.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error: PostgrestError) => {
      toast.error(error.message);
    },
  });
}

export function useSupabaseUpdate<T>({
  table,
  invalidateQueries,
  successMessage,
}: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<T> }) => {
      const { data: result, error } = await supabase
        .from(table as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      if (invalidateQueries) {
        invalidateQueries.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error: PostgrestError) => {
      toast.error(error.message);
    },
  });
}

export function useSupabaseDelete({ table, invalidateQueries, successMessage }: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      if (invalidateQueries) {
        invalidateQueries.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
      if (successMessage) {
        toast.success(successMessage);
      }
    },
    onError: (error: PostgrestError) => {
      toast.error(error.message);
    },
  });
}
