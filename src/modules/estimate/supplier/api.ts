import { supabase } from '@/integrations/supabase/client';
import type { SupplierIntelRequest, SupplierIntelResponse } from '@/modules/estimate/supplier/types';

function pruneUndefined<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) as Partial<T>;
}

export async function invokeSupplierIntelligence(request: SupplierIntelRequest): Promise<SupplierIntelResponse> {
  const payload = pruneUndefined({
    ...request,
    includeAiSummary: request.includeAiSummary ?? true,
  });

  const { data, error } = await supabase.functions.invoke<SupplierIntelResponse>('supplier-intel', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message ?? 'Failed to retrieve supplier intelligence');
  }
  if (!data) {
    throw new Error('Supplier intelligence response was empty');
  }

  return data;
}
