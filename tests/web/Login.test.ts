import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { awaitWithScreenshot } from '../../utils/awaitWithScreenshot';
import { maxCleanPage } from '../../utils/cacheHelper';

const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.beforeEach(async ({ context, page }) => {
  await maxCleanPage(context, page, 'https://staging.lokasi.com/intelligence/login');
});

test.describe('Authentication Flow', () => {
  test('user can login successfully', async ({ page }, testInfo) => {
    await awaitWithScreenshot(
      login(page, TEST_USER, TEST_PASSWORD),
      page, testInfo, 'login'
    );

    await awaitWithScreenshot(
      expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 }),
      page, testInfo, 'loading-visible'
    );
    await awaitWithScreenshot(
      page.waitForLoadState('networkidle'),
      page, testInfo, 'networkidle'
    );
    await awaitWithScreenshot(
      expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible(),
      page, testInfo, 'dashboard-link'
    );
    await awaitWithScreenshot(
      expect(page).toHaveTitle(/LOKASI/),
      page, testInfo, 'title'
    );
  });

  test('user can logout successfully', async ({ page }, testInfo) => {
    await awaitWithScreenshot(
      login(page, TEST_USER, TEST_PASSWORD),
      page, testInfo, 'login'
    );
    await awaitWithScreenshot(
      expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 }),
      page, testInfo, 'loading-visible'
    );
    await awaitWithScreenshot(
      page.waitForLoadState('networkidle'),
      page, testInfo, 'networkidle'
    );
    await awaitWithScreenshot(
      expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible(),
      page, testInfo, 'dashboard-link'
    );
    await awaitWithScreenshot(
      page.getByTestId('user-popover-trigger').click(),
      page, testInfo, 'user-popover'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Log out' }).click(),
      page, testInfo, 'logout-click'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Logout' }).click(),
      page, testInfo, 'logout-confirm'
    );
    await awaitWithScreenshot(
      expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 100000 }),
      page, testInfo, 'welcome-back'
    );
  });
});