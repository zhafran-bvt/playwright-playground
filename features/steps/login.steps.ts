import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { Given, When, Then } = createBdd(test);

Given('I am on the login page', async ({ page }) => {
  await page.goto('/intelligence/login', { waitUntil: 'load' });
});

When('I sign in with valid credentials', async ({ page }) => {
  const email = process.env.TEST_USER as string;
  const password = process.env.TEST_PASSWORD as string;

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
});

Then('I see the dashboard', async ({ page }) => {
  await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
  await expect(page).toHaveTitle(/LOKASI/);
});
