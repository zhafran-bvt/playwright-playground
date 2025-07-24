import { Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Capture a screenshot with a structured name: <testTitle>_<timestamp>.png
 */
export async function takeScreenshot(page: Page, testInfo: TestInfo, stepName = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const folderPath = path.resolve('screenshots');

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fileName = `${safeTitle}${stepName ? '_' + stepName : ''}_${timestamp}.png`;
  const filePath = path.join(folderPath, fileName);

  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filePath}`);
}