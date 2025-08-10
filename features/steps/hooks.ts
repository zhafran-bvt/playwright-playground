import { createBdd, test } from 'playwright-bdd';
import { SharedState } from './sharedState';

// Take a screenshot after every executed step and attach to the report
const { Before, AfterStep } = createBdd(test);

// Only take screenshots for web-tagged scenarios
AfterStep('@web', async ({ page, $testInfo, $step }) => {
  try {
    if (page && typeof page.screenshot === 'function') {
      const image = await page.screenshot();
      await $testInfo.attach(`After step: ${$step?.title ?? 'unknown'}`, {
        body: image,
        contentType: 'image/png',
      });
    }
  } catch {
    // Ignore screenshot errors to not fail steps
  }
});

// Clear analysis overrides at the start of each @api scenario
Before('@api', async ({ $testInfo }) => {
  try {
    const key = `${$testInfo.project.name}:${$testInfo.file}`;
    SharedState.analysisOverridesByFeature.delete(key);
  } catch {
    // ignore
  }
});
