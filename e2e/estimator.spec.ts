import { expect, test } from '@playwright/test';

test.describe('Estimator enhancements', () => {
  test('Scenario planner and export controls render', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: /review/i }).click();

    await expect(page.getByText('Scenario Lab')).toBeVisible();
    await expect(page.getByText('Premium Weekend Blitz')).toBeVisible();

    const recalc = page.getByRole('button', { name: /recalculate/i }).first();
    await recalc.click();

    await expect(page.getByRole('button', { name: /Export Proposal PDF/i })).toBeVisible();
  });
});
