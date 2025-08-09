import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { SharedState } from './sharedState';

const { Then } = createBdd(test);

Then('I should have a non-empty access token', async ({ $testInfo }) => {
  const token = SharedState.tokenByTest.get($testInfo.testId);
  expect(token, 'Access token should be present').toBeTruthy();
  expect(typeof token).toBe('string');
  expect((token as string).length).toBeGreaterThan(20);
});
