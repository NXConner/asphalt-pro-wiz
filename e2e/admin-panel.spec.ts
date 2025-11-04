import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests require authentication setup
    // In a real environment, you'd authenticate before these tests
    test.skip();
  });

  test('displays admin panel for admin users', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.getByRole('heading', { name: /admin panel/i })).toBeVisible();
    await expect(page.getByText(/manage user roles/i)).toBeVisible();
  });

  test('shows list of users', async ({ page }) => {
    await page.goto('/admin');
    
    // Should display users table/list
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('allows granting admin role', async ({ page }) => {
    await page.goto('/admin');
    
    // Find email input
    const emailInput = page.getByLabel(/admin email/i);
    await emailInput.fill('newadmin@example.com');
    
    // Click grant admin button
    await page.getByRole('button', { name: /grant admin/i }).click();
    
    // Should show success message
    await expect(page.getByText(/admin role granted/i)).toBeVisible();
  });

  test('allows revoking admin role', async ({ page }) => {
    await page.goto('/admin');
    
    // Find and click revoke button for a user
    await page.getByRole('button', { name: /revoke admin/i }).first().click();
    
    // Should show success message
    await expect(page.getByText(/admin role revoked/i)).toBeVisible();
  });

  test('redirects non-admin users', async ({ page }) => {
    // If user is not admin, should redirect or show access denied
    await page.goto('/admin');
    
    // Should redirect to home or show error
    await expect(page).not.toHaveURL(/.*admin/);
  });
});
