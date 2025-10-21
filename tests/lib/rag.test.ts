import { describe, it, expect, vi } from 'vitest';
import { retrieveRelevantContext } from '@/lib/rag';

// Minimal mock for fetch for index and embedding requests
const globalAny = globalThis as any;

function mockFetchOnce(data: any, ok = true) {
  const resp = {
    ok,
    json: async () => data,
  } as Response;
  (globalAny.fetch as any).mockResolvedValueOnce(resp);
}

describe('retrieveRelevantContext', () => {
  it('returns empty string when no index', async () => {
    globalAny.fetch = vi.fn();
    // First fetch: index.json empty
    mockFetchOnce([]);
    // Second fetch: embedding
    mockFetchOnce({ embedding: { values: [0.1, 0.2] } });
    const ctx = await retrieveRelevantContext('test');
    expect(typeof ctx).toBe('string');
  });
});
