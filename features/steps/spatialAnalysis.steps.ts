import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { When, Then } = createBdd(test);

When('I open Spatial Settings', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Toggle Spatial Settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle Spatial Settings' }).click();
});

When('I choose Administrative Area', async ({ page }) => {
  await page.getByRole('button', { name: 'Dropdown menu' }).click();
  await page.getByRole('menuitem', { name: 'Administrative Area' }).click();
  await page.getByRole('button', { name: 'Set Administrative Area' }).click();
});

When(
  'I set Administrative Area Country {string} Province {string} City {string} District {string}',
  async ({ page }, country: string, province: string, city: string, district: string) => {
    await page.getByRole('textbox', { name: 'Search Country' }).click();
    await page.getByRole('menuitem', { name: country }).click();

    await page.getByRole('textbox', { name: 'Search Province' }).click();
    await page.getByRole('textbox', { name: 'Search Province' }).fill(province.slice(0, 3));
    await page.getByRole('menuitem', { name: province }).click();

    await page.getByRole('textbox', { name: 'Search City' }).click();
    await page.getByRole('menuitem', { name: city }).click();

    await page.getByRole('textbox', { name: 'Search District' }).click();
    await page.getByRole('menuitem', { name: district }).click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }
);

When('I select H3 resolution {string}', async ({ page }, resolution: string) => {
  await page.locator('.flex.flex-col.mt-3').first().scrollIntoViewIfNeeded();
  await page.locator('label').filter({ hasText: 'H3H3 (Hexagonal Hierarchical' }).click();
  await page.locator('button').filter({ hasText: 'Resolution' }).click();
  await page.getByRole('menuitem', { name: resolution }).click();
});

When('I generate analysis results', async ({ page }) => {
  await page.getByTestId('generate-results-button').click();
});

Then('I see the dashboard marker and Spatial Analysis title', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible({ timeout: 30000 });
  await expect(page).toHaveTitle(/Spatial Analysis - LOKASI/);
});
