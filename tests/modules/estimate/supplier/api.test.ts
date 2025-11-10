import { beforeEach, describe, expect, it, vi } from 'vitest';

import { invokeSupplierIntelligence } from '@/modules/estimate/supplier/api';
import type { SupplierIntelResponse } from '@/modules/estimate/supplier/types';

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

describe('invokeSupplierIntelligence', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('invokes supplier-intel edge function with sanitized payload and returns result', async () => {
    const mockResponse: SupplierIntelResponse = {
      orgId: '00000000-0000-0000-0000-000000000000',
      materials: ['Acrylic Sealer'],
      generatedAt: new Date().toISOString(),
      insights: [],
      bestOffers: {},
      aiSummary: null,
    };

    invokeMock.mockResolvedValue({ data: mockResponse, error: null });

    const result = await invokeSupplierIntelligence({
      materials: ['Acrylic Sealer', ''],
      radiusMiles: undefined,
      jobLocation: undefined,
    });

    expect(invokeMock).toHaveBeenCalledWith('supplier-intel', {
      body: {
        materials: ['Acrylic Sealer', ''],
        includeAiSummary: true,
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws when edge function returns an error', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    await expect(
      invokeSupplierIntelligence({
        materials: ['Acrylic Sealer'],
      }),
    ).rejects.toThrow('boom');
  });
});
