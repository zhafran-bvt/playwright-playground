import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { takeScreenshot } from '../../utils/screenshotHelper';
import { attachToAllure } from '../../utils/allureHelper';

// Extract credentials from environment variables
const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

// Take screenshot at the end of each test and attach to Allure
test.afterEach(async ({ page }, testInfo) => {
  // Take screenshot and attach to Allure
  const screenshot = await page.screenshot();
  await attachToAllure(testInfo, 'Final Screenshot', screenshot, 'image/png');
  // Optionally save to disk as well
  await takeScreenshot(page, testInfo, 'final');
});

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }) => {
    await login(page, TEST_USER, TEST_PASSWORD);

    // Wait for loading indicator and dashboard
    await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();

    await expect(page).toHaveTitle(/LOKASI/);
  });

  test('user can logout successfully', async ({ page }) => {
    await login(page, TEST_USER, TEST_PASSWORD);

    await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();

    await page.getByTestId('user-popover-trigger').click();
    await page.getByRole('button', { name: 'Log out' }).click();
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 10000 });
  });
});