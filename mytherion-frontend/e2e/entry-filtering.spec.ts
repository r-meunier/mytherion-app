import { test, expect } from '@playwright/test';

test.describe('Entry Filtering E2E', () => {
  // Note: This test requires a running backend with a seeded test user and project.
  // MYT-16 will fully address the E2E infrastructure and seeding.
  // This test validates the UI flow for MYT-7 filter implementations.

  test('should filter entries by search text, type and tags', async ({ page }) => {
    // 1. Login (assuming a test user exists)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to the projects list
    await page.waitForURL('/');

    // 2. Navigate to first project's codex
    // Assuming there's a link to the first project
    await page.click('a[href^="/projects/"]:has-text("Codex")');

    // 3. Verify Search Filtering
    await page.fill('input[placeholder*="Search"]', 'Gandalf');
    // Wait for the debounce/API call
    await page.waitForTimeout(500); 
    // Check if the entry is visible
    await expect(page.locator('text=Gandalf')).toBeVisible();

    // 4. Verify Type Filtering
    await page.click('button:has-text("CHARACTER")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=Gandalf')).toBeVisible();

    // 5. Verify empty state when filters don't match
    await page.click('button:has-text("LOCATION")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=No entries found')).toBeVisible();
  });
});
