import { createBdd, test } from 'playwright-bdd';

// Take a screenshot after every executed step and attach to the report
const { AfterStep } = createBdd(test);

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
