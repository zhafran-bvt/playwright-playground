import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { awaitWithScreenshot } from '../../utils/awaitWithScreenshot';
import { DATASETS } from '../datasets';
import { maxCleanPage } from '../../utils/cacheHelper';

const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.beforeEach(async ({ context, page }) => {
  await maxCleanPage(context, page, 'https://staging.lokasi.com/intelligence');
  await login(page, TEST_USER, TEST_PASSWORD);
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});


test.describe('Spatial Analysis', () => {
  test('user can do spatial analysis with 1 datasets using settings adm_area and h3 output', async ({ page }, testInfo) => {
    await awaitWithScreenshot(
      page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click(),
      page, testInfo, 'dataset-explorer'
    );
    await awaitWithScreenshot(
      expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 }),
      page, testInfo, 'modal-heading'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: DATASETS.BVT }).click(),
      page, testInfo, 'bvt-dataset'
    );
    await awaitWithScreenshot(
      expect(page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' })).toBeVisible(),
      page, testInfo, 'add-dataset-visible'
    );
    await awaitWithScreenshot(
      page.waitForTimeout(3000),
      page, testInfo, 'wait-timeout'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Add Dataset' }).dblclick(),
      page, testInfo, 'add-dataset-dblclick'
    );
    await awaitWithScreenshot(
      expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(DATASETS.BVT, { timeout: 10000 }),
      page, testInfo, 'notification-bvt'
    );
    await awaitWithScreenshot(
      expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 10000 }),
      page, testInfo, 'marker-link'
    );
    await awaitWithScreenshot(
      expect(page).toHaveTitle(/Spatial Analysis - LOKASI/),
      page, testInfo, 'title'
    );
    await awaitWithScreenshot(
      expect(page.getByRole('button', { name: 'Toggle Spatial Settings' })).toBeVisible(),
      page, testInfo, 'toggle-spatial-settings-visible'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Toggle Spatial Settings' }).click(),
      page, testInfo, 'toggle-spatial-settings-click'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Dropdown menu' }).click(),
      page, testInfo, 'dropdown-menu'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: 'Administrative Area' }).click(),
      page, testInfo, 'adm-area'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Set Administrative Area' }).click(),
      page, testInfo, 'set-adm-area'
    );
    await awaitWithScreenshot(
      page.getByRole('textbox', { name: 'Search Country' }).click(),
      page, testInfo, 'country-search'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: 'Indonesia' }).click(),
      page, testInfo, 'indonesia-select'
    );
    await awaitWithScreenshot(
      page.getByRole('textbox', { name: 'Search Province' }).click(),
      page, testInfo, 'province-search'
    );
    await awaitWithScreenshot(
      page.getByRole('textbox', { name: 'Search Province' }).fill('Dki'),
      page, testInfo, 'province-fill'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: 'Dki Jakarta' }).click(),
      page, testInfo, 'dkijakarta-select'
    );
    await awaitWithScreenshot(
      page.getByRole('textbox', { name: 'Search City' }).click(),
      page, testInfo, 'city-search'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: 'Jakarta Timur' }).click(),
      page, testInfo, 'jakartatimur-select'
    );
    await awaitWithScreenshot(
      page.getByRole('textbox', { name: 'Search District' }).click(),
      page, testInfo, 'district-search'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: 'Duren Sawit' }).click(),
      page, testInfo, 'durensawit-select'
    );
    await awaitWithScreenshot(
      page.getByRole('button', { name: 'Save', exact: true }).click(),
      page, testInfo, 'save'
    );
    await awaitWithScreenshot(
      page.locator('.flex.flex-col.mt-3').first().scrollIntoViewIfNeeded(),
      page, testInfo, 'scroll-analysis'
    );
    await awaitWithScreenshot(
      page.locator('label').filter({ hasText: 'H3H3 (Hexagonal Hierarchical' }).click(),
      page, testInfo, 'h3-label'
    );
    await awaitWithScreenshot(
      page.locator('button').filter({ hasText: 'Resolution' }).click(),
      page, testInfo, 'resolution-btn'
    );
    await awaitWithScreenshot(
      page.getByRole('menuitem', { name: '1.40Km 5.16Km2' }).click(),
      page, testInfo, 'resolution-select'
    );
    await awaitWithScreenshot(
      page.getByTestId('generate-results-button').click(),
      page, testInfo, 'generate-results'
    );
  });
});