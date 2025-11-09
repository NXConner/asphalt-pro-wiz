import { expect, test } from '@playwright/test';

test.describe('Lovable preview smoke', () => {
  test('renders under nested base path', async ({ page }) => {
    await page.addInitScript(({ basePath }) => {
      (window as typeof window & { __LOVABLE__?: Record<string, unknown> }).__LOVABLE__ = {
        basePath,
      };
    }, { basePath: '/preview/smoke' });

    await page.goto('/preview-smoke.html');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.evaluate(() => ({
      dataset: document.documentElement.dataset.routerBase ?? null,
      routerBase: (window as typeof window & { __PPS_ROUTER_BASE?: string }).__PPS_ROUTER_BASE ?? null,
      lovable: (window as typeof window & { __LOVABLE__?: Record<string, unknown> }).__LOVABLE__ ?? null,
    }));
    await page.waitForFunction(() => {
      const win = window as typeof window & { __PPS_ROUTER_BASE?: string };
      const dataset = document.documentElement.dataset.routerBase;
      return dataset === '/preview/smoke' || win.__PPS_ROUTER_BASE === '/preview/smoke';
    });

    const routingInfo = await page.evaluate(() => ({
      pathname: window.location.pathname,
      hasLovable: Boolean((window as typeof window & { __LOVABLE__?: unknown }).__LOVABLE__),
      routerBase: (window as typeof window & { __PPS_ROUTER_BASE?: string }).__PPS_ROUTER_BASE,
      dataset: document.documentElement.dataset.routerBase ?? null,
    }));
    expect(routingInfo.pathname).toBe('/preview-smoke.html');
    expect(routingInfo.hasLovable).toBe(true);
    if (routingInfo.dataset) {
      expect(routingInfo.dataset).toBe('/preview/smoke');
    }
    if (routingInfo.routerBase) {
      expect(routingInfo.routerBase).toBe('/preview/smoke');
    }

    const harnessSnapshot = await page.evaluate(
      () => (window as typeof window & { __PPS_PREVIEW_SNAPSHOT__?: { baseName: string } })
        .__PPS_PREVIEW_SNAPSHOT__?.baseName,
    );
    expect(harnessSnapshot).toBe('/preview/smoke');

    const resultText = await page.textContent('#result');
    expect(resultText).toContain('/preview/smoke');
  });
});
