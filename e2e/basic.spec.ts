import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('pps:demo-auth', JSON.stringify({ email: 'demo@playwright.test' }));
  });
  await page.goto('/');
  await expect(page.getByText('CONNER Asphalt Estimator')).toBeVisible();
});
