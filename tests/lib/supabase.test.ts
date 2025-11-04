import { describe, it, expect, vi, beforeEach } from 'vitest';

import { safeQuery, checkPermission } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Supabase Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('safeQuery', () => {
    it('should return data on success', async () => {
      const mockData = { id: 1, name: 'Test' };
      const queryFn = vi.fn().mockResolvedValue({ data: mockData, error: null });

      const result = await safeQuery(queryFn);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockError = { message: 'Test error' };
      const queryFn = vi.fn().mockResolvedValue({ data: null, error: mockError });

      const result = await safeQuery(queryFn);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should catch thrown errors', async () => {
      const queryFn = vi.fn().mockRejectedValue(new Error('Thrown error'));

      const result = await safeQuery(queryFn);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
    });
  });
});
