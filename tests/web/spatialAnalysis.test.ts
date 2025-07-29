import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { takeScreenshot } from '../../utils/screenshotHelper';
import { attachToAllure } from '../../utils/allureHelper';
import { DATASETS } from '../datasets';
import { time } from 'console';

const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.beforeEach(async ({ page }) => {
  await login(page, TEST_USER, TEST_PASSWORD);
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});

test.afterEach(async ({ page }, testInfo) => {
  // Take screenshot and attach to Allure
  const screenshot = await page.screenshot();
  await attachToAllure(testInfo, 'Final Screenshot', screenshot, 'image/png');
  // Optionally save to disk as well
  await takeScreenshot(page, testInfo, 'final');
});

test.describe('Spatial Analysis', () => {
  test('user can do spatial analysis with 1 datasets using settings adm_area and h3 output', async ({ page }) => {

    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click()
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });

    await page.getByRole('button', { name: DATASETS.BVT }).click();
    await expect(page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' })).toBeVisible();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: 'Add Dataset' }).dblclick();
    await expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(DATASETS.BVT, { timeout: 10000 });
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 10000 }); 
    
    await expect(page).toHaveTitle(/Spatial Analysis - LOKASI/);

    await expect(page.getByRole('button', { name: 'Toggle Spatial Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Toggle Spatial Settings' }).click();
    await page.getByRole('button', { name: 'Dropdown menu' }).click();
    await page.getByRole('menuitem', { name: 'Administrative Area' }).click();
    await page.getByRole('button', { name: 'Set Administrative Area' }).click();
    await page.getByRole('textbox', { name: 'Search Country' }).click();
    await page.getByRole('menuitem', { name: 'Indonesia' }).click();
    await page.getByRole('textbox', { name: 'Search Province' }).click();
    await page.getByRole('textbox', { name: 'Search Province' }).fill('Dki');
    await page.getByRole('menuitem', { name: 'Dki Jakarta' }).click();
    await page.getByRole('textbox', { name: 'Search City' }).click();
    await page.getByRole('menuitem', { name: 'Jakarta Timur' }).click();
    await page.getByRole('textbox', { name: 'Search District' }).click();
    await page.getByRole('menuitem', { name: 'Duren Sawit' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await page.locator('.flex.flex-col.mt-3').first().scrollIntoViewIfNeeded();

    await page.locator('label').filter({ hasText: 'H3H3 (Hexagonal Hierarchical' }).click();
    await page.locator('button').filter({ hasText: 'Resolution' }).click();
    await page.getByRole('menuitem', { name: '1.40Km 5.16Km2' }).click();
    await page.getByTestId('generate-results-button').click();

  });
});