import { expect, test } from '@playwright/test';

test.describe('Mission Scheduler', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const baseFlags = {
        imageAreaAnalyzer: true,
        aiAssistant: true,
        pwa: true,
        i18n: true,
        receipts: true,
        ownerMode: false,
        scheduler: true,
        optimizer: false,
        customerPortal: false,
        observability: true,
        commandCenter: true,
      } as const;
      window.localStorage.setItem('pps:flags', JSON.stringify(baseFlags));
      window.localStorage.setItem(
        'pps:demo-auth',
        JSON.stringify({ email: 'demo@scheduler.test' }),
      );
    });
  });

  test('adds mission and renders on tactical timeline', async ({ page }) => {
    await page.goto('/');

    const missionForm = page.getByTestId('mission-task-form');
    await expect(missionForm).toBeVisible();

    await page.fill('#mission-title', 'Playwright Mission');
    await page.fill('#mission-site', 'QA Test Lot');
    await page.fill('#mission-start', '2025-01-08T09:00');
    await page.fill('#mission-duration', '4');

    await page.getByTestId('mission-submit').click();

    await expect(page.getByText('Playwright Mission')).toBeVisible();
  });
});
