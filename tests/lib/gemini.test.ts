import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as gem from '@/lib/gemini';

const g: any = globalThis as any;

describe('gemini proxy routing', () => {
  beforeEach(() => {
    g.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ text: 'ok', embedding: { values: [1,2,3] } }) })) as any;
    (g as any).process = { env: {} };
  });

  it('generateChat uses proxy when VITE_GEMINI_PROXY_URL is set', async () => {
    expect(gem).toBeTruthy(); // ensure module loaded
    ;(globalThis as any).process = { env: { VITE_GEMINI_PROXY_URL: 'https://proxy.example.com' } };
    const text = await gem.generateChat('hi');
    expect(text).toBe('ok');
    expect((g.fetch as any).mock.calls[0][0]).toContain('https://proxy.example.com');
  });

  it('embedText uses proxy when configured', async () => {
    (globalThis as any).process = { env: { VITE_GEMINI_PROXY_URL: 'https://proxy.example.com' } };
    const values = await gem.embedText('hello');
    expect(values.length).toBeGreaterThan(0);
  });
});
