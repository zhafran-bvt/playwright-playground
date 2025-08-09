import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';

const { When, Then } = createBdd(test);

When('I open the user menu', async ({ page }) => {
  await page.getByTestId('user-popover-trigger').click();
});

When('I choose to log out', async ({ page }) => {
  await page.getByRole('button', { name: 'Log out' }).click();
});

When('I confirm log out', async ({ page }) => {
  await page.getByRole('button', { name: 'Logout' }).click();
});

Then('I see the Welcome Back screen', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 100000 });
});
