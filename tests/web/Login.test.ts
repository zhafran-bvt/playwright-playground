import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { takeScreenshot } from '../../utils/screenshotHelper';

// Extract credentials from environment variables
const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.afterEach(async ({ page }, testInfo) => {
  await takeScreenshot(page, testInfo, 'final');  // screenshot at the end of test
});

test('user can login successfully', async ({ page }) => {
  // Navigate to the login page
  await login(page, TEST_USER, TEST_PASSWORD);

  // verify successful login by getByText('Loading your map...') is visible
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });

  // Wait for successful login by checking the page title
  await expect(page, 'User should be redirected to dashboard after login')
    .toHaveTitle(/Login - LOKASI/, { timeout: 10000 });

  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});

test('user can logout successfully', async ({ page }) => {
  // First, perform login (setup for this test)
  await login(page, TEST_USER, TEST_PASSWORD);
  
  // verify successful login by getByText('Loading your map...') is visible
  
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
  
  await page.waitForLoadState('networkidle');  // wait until network is idle 

  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();

  // Now perform logout
  await page.getByTestId('user-popover-trigger').waitFor({ state: 'visible' });
  await page.getByTestId('user-popover-trigger').click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();

  //wait for 5 seconds to ensure the page loads completely
  await page.waitForTimeout(5000);

  // Verify logout success
  await expect(page.getByRole('heading', { name: 'Welcome Back' }), 
    'User should be redirected to login page after logout')
    .toBeVisible();
});