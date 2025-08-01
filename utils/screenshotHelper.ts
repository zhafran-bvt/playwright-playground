import { Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Capture a screenshot with a structured name: <testTitle>_<stepName>_<timestamp>.png
 * Attaches the screenshot to Allure report if testInfo is provided.
 */
export async function takeScreenshot(page: Page, testInfo?: TestInfo, stepName = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTitle = testInfo ? testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'screenshot';
  const safeStep = stepName ? stepName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : '';
  const folderPath = path.resolve('screenshots');

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `${safeTitle}${safeStep ? '_' + safeStep : ''}_${timestamp}.png`;
  const filePath = path.join(folderPath, fileName);

  const buffer = await page.screenshot({ path: filePath, fullPage: true });

  // Attach to Allure if testInfo is available
  if (testInfo) {
    await testInfo.attach(
      `Screenshot${stepName ? ` - ${stepName}` : ''}`,
      { body: buffer, contentType: 'image/png' }
    );
  }
}