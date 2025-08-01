import { Page, TestInfo } from '@playwright/test';
import { takeScreenshot } from './screenshotHelper';

export async function awaitWithScreenshot<T>(
  promise: Promise<T>,
  page: Page,
  testInfo: TestInfo,
  stepName = ''
): Promise<T> {
  const result = await promise;
  await takeScreenshot(page, testInfo, stepName);
  return result;
}