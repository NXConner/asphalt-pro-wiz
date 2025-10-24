import { test, expect } from '@playwright/test';

// Requires dev server running (Playwright config will reuseExistingServer)

test('toggle theme and upload file', async ({ page, context }) => {
  await page.goto('/');

  // Theme toggle button exists
  const toggle = page.getByRole('button', { name: 'Toggle theme' });
  await expect(toggle).toBeVisible();

  // Read initial class on <html>
  const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await toggle.click();
  await page.waitForTimeout(200);
  const afterToggleIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  expect(afterToggleIsDark).not.toBe(initialIsDark);

  // Navigate to Settings tab
  await page.getByRole('tab', { name: 'Settings' }).click();

  // Ensure Feature Flags section exists and toggle Image Area Analyzer
  const iaaToggle = page.getByLabel('Image Area Analyzer');
  await expect(iaaToggle).toBeVisible();
  await iaaToggle.click();

  // Back to Estimate tab
  await page.getByRole('tab', { name: 'Estimate' }).click();
  await page.waitForTimeout(200);

  // If image analyzer is visible, we will see its header
  const analyzerHeader = page.getByText('Image Area Analyzer');
  await expect(analyzerHeader).toBeVisible();

  // Go to Invoice tab and use Uploads panel
  await page.getByRole('tab', { name: 'Invoice' }).click();
  await page.waitForTimeout(200);

  // Upload file via the UploadsPanel input
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByLabel('Upload Files (images, pdf, docx, xlsx, etc.)').click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
  // Expect list to show file name text somewhere eventually (non-deterministic if filtered). We'll just assert the Download link appears.
  await expect(page.getByText('Download')).toBeVisible();
});
