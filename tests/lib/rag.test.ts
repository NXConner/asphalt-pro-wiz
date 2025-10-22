import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    (globalAny.process as any) = { env: { GEMINI_API_KEY: 'test' } };
  });
  it('returns empty string when no index', async () => {
    globalAny.fetch = vi.fn();
    // First fetch: index.json empty
    mockFetchOnce([]);
    // Stub embedText call path by returning empty vector
    mockFetchOnce({ embedding: { values: [] } });
    const ctx = await retrieveRelevantContext('test');
    expect(ctx).toBe('');
  });
});
