import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('pps:demo-auth');
    });
    await page.goto('/');
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    // Should redirect to /auth
    await expect(page).toHaveURL(/.*auth/);
  });

  test('displays sign in form', async ({ page }) => {
    await page.goto('/auth');

    // Check for sign in tab
    await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();

    // Check for form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('displays sign up form', async ({ page }) => {
    await page.goto('/auth');

    // Click sign up tab
    await page.getByRole('tab', { name: /sign up/i }).click();

    // Check for form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/auth');

    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('validates password length', async ({ page }) => {
    await page.goto('/auth');

    // Enter short password
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation error
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test('disables submit button during submission', async ({ page }) => {
    await page.goto('/auth');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Protected Routes', () => {
  test('authenticated users can access main app', async ({ page }) => {
    // This test requires a real authenticated session
    // In a real test environment, you'd set up authentication first
    test.skip();
  });

  test('authenticated users can access command center', async ({ page }) => {
    // This test requires a real authenticated session
    test.skip();
  });

  test('authenticated users can access admin panel if admin', async ({ page }) => {
    // This test requires a real authenticated session with admin role
    test.skip();
  });
});
