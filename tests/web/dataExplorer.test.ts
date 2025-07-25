import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { takeScreenshot } from '../../utils/screenshotHelper';
import { DATASETS } from '../datasets';

const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.beforeEach(async ({ page }) => {
  await login(page, TEST_USER, TEST_PASSWORD);
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  await takeScreenshot(page, testInfo, 'final');
});

test.describe('Data Explorer', () => {
  test('user can access Data Explorer', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });
    await expect(page).toHaveTitle(/Data Explorer - LOKASI/);
  });

  test('user can add BVT dataset from Data Explorer', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });
    await page.getByRole('button', { name: DATASETS.BVT }).click();

    // Wait for Add Dataset button to be enabled instead of fixed timeout
    const addButton = page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' });
    await expect(addButton).toBeEnabled({ timeout: 10000 });

    //do wait 5 seconds
    await page.waitForTimeout(5000);
    await addButton.click();
    // Wait for notification and dashboard link
    await expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(DATASETS.BVT, { timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 10000 });
  });

  test('user can add User dataset from Data Explorer', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });
    await page.getByRole('button', { name: 'My Organization' }).click();
    await page.getByRole('button', { name: DATASETS.USER }).click();

    const addButton = page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' });
    await expect(addButton).toBeEnabled({ timeout: 10000 });

    //do wait 5 seconds
    await page.waitForTimeout(5000);
    await addButton.click();
    // Wait for notification and dashboard link
    await expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(DATASETS.USER, { timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 10000 });
  });

  test('user can add search datasets on Data Explorer', async ({ page }) => {
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });
    await page.getByRole('button', { name: 'My Organization' }).click();
    await page.getByRole('button', { name: DATASETS.USER }).click();

    const addButton = page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' });
    await expect(addButton).toBeEnabled({ timeout: 10000 });

    //do wait 5 seconds
    await page.waitForTimeout(5000);
    await addButton.click();
    // Wait for notification and dashboard link
    await expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(DATASETS.USER, { timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 10000 });
  });
});