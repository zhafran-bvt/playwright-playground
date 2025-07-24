import { test, expect } from '@playwright/test';
import { login } from '../../utils/loginHelper';
import { takeScreenshot } from '../../utils/screenshotHelper';

// Extract credentials from environment variables
const TEST_USER = process.env.TEST_USER;
const TEST_PASSWORD = process.env.TEST_PASSWORD;


test.afterEach(async ({ page }, testInfo) => {
  await takeScreenshot(page, testInfo, 'final');  // screenshot at the end of test
});


test('user can access Data Explorer', async ({ page }) => {
    await login(page, TEST_USER, TEST_PASSWORD);

      // verify successful login by getByText('Loading your map...') is visible
    await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
    
    await page.waitForLoadState('networkidle');  // wait until network is idle
    
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
    
    // Navigate to Data Explorer
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();

    // make sure text Data Explorer is visible
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer',{ timeout: 10000 });
    await expect(page).toHaveTitle(/Data Explorer - LOKASI/,);
});

test('user can add BVT dataset from Data Explorer', async ({ page }) => {
    await login(page, TEST_USER, TEST_PASSWORD);

      // verify successful login by getByText('Loading your map...') is visible
    await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
    
    await page.waitForLoadState('networkidle');  // wait until network is idle
    
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
    
    // Navigate to Data Explorer
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();

    // make sure text Data Explorer is visible
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer',{ timeout: 10000 });
    
    await page.getByRole('button', { name: 'Thematic Village SES 2022' }).click();
    await page.getByRole('button', { name: 'Add Dataset' }).dblclick({ timeout: 10000 });
    await page.waitForTimeout(5000);
    
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();


});

test('user can add User dataset from Data Explorer', async ({ page }) => {
    await login(page, TEST_USER, TEST_PASSWORD);

      // verify successful login by getByText('Loading your map...') is visible
    await expect(page.getByText('Loading your map...')).toBeVisible({ timeout: 10000 });
    
    await page.waitForLoadState('networkidle');  // wait until network is idle
    
    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
    
    // Navigate to Data Explorer
    await page.getByRole('button').filter({ hasText: 'Dataset Explorer' }).click();

    // make sure text Data Explorer is visible
    await expect(page.getByTestId('modal').getByRole('heading')).toContainText('Dataset Explorer',{ timeout: 10000 });

    await page.getByRole('button', { name: 'My Organization' }).click();

    await page.getByRole('button', { name: 'VISA Average Transaction' }).click();
    await page.getByRole('button', { name: 'Add Dataset' }).dblclick({ timeout: 10000 });
    // sleep for 5 seconds to ensure the dataset is added   
    await page.waitForTimeout(5000);

    await expect(page.getByRole('link', { name: 'Lokasi Intelligence Marker' })).toBeVisible();
});