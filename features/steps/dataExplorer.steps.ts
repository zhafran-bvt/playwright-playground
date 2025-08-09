import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, When, Then } = createBdd(test);

Given('I am logged in', async ({ page }) => {
  await page.goto('/intelligence/login', { waitUntil: 'load' });
  const email = process.env.TEST_USER as string;
  const password = process.env.TEST_PASSWORD as string;

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});

When('I open the Dataset Explorer', async ({ page }) => {
  await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();
});

Then('I see the Dataset Explorer modal', async ({ page }) => {
  await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer', { timeout: 10000 });
});

Then('I see the Data Explorer page title', async ({ page }) => {
  await expect(page).toHaveTitle(/Data Explorer - LOKASI/);
});

When('I switch to catalog {string}', async ({ page }, catalog: string) => {
  await page.getByRole('button', { name: catalog }).click();
});

When('I add dataset {string}', async ({ page }, datasetName: string) => {
  await page.getByRole('button', { name: datasetName }).click();
  const addButton = page.getByTestId('modal').getByRole('button', { name: 'Add Dataset' });
  await expect(addButton).toBeEnabled({ timeout: 15000 });
  await addButton.click();
});

Then('I see dataset notification {string}', async ({ page }, datasetName: string) => {
  await expect(page.getByLabel('Notifications Alt+T').locator('span')).toContainText(datasetName, { timeout: 30000 });
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});
