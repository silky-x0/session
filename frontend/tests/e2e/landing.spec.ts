import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check main heading is visible
    await expect(page.locator('h1')).toContainText('real-time');
    await expect(page.locator('h1')).toContainText('session');
  });

  test('should have working session mode toggle', async ({ page }) => {
    await page.goto('/');

    // Default should be Start Session mode
    const input = page.locator('input');
    await expect(input).toHaveAttribute('placeholder', /Paste a problem/i);

    // Click Join Session
    await page.getByRole('button', { name: /join session/i }).click();

    // Should switch to Join mode
    await expect(input).toHaveAttribute('placeholder', /Enter room ID/i);
  });

  test('should navigate to editor when starting session', async ({ page }) => {
    await page.goto('/');

    // Click the submit button without entering text (should generate random room)
    await page.locator('button').last().click();

    // Should navigate to editor with room parameter
    await expect(page).toHaveURL(/\/editor\?room=.+/);
  });

  test('should join existing room', async ({ page }) => {
    await page.goto('/');

    // Switch to Join mode
    await page.getByRole('button', { name: /join session/i }).click();

    // Enter room ID
    await page.locator('input').fill('my-test-room');

    // Click submit
    await page.locator('button').last().click();

    // Should navigate to editor with the specified room
    await expect(page).toHaveURL('/editor?room=my-test-room');
  });
});
