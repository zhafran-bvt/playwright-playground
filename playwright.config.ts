import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import { defineBddConfig } from 'playwright-bdd';
import TerminalReporter from './utils/reportHelper'; // Custom reporter for terminal output

// Configure BDD (Cucumber/Gherkin) -> Playwright bridge
// Split BDD generated specs into Web and API to optimize execution
const bddWebTestDir = defineBddConfig({
  outputDir: './tests/bdd/web',
  features: './features/**/*.feature',
  steps: ['./features/steps/**/*.ts'],
  tags: 'not @api',
});

const bddApiTestDir = defineBddConfig({
  outputDir: './tests/api/bdd',
  features: './features/**/*.feature',
  steps: ['./features/steps/**/*.ts'],
  tags: '@api',
});

export default defineConfig({
  // Remove the global testDir since we'll define it per project
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['allure-playwright'], ['./utils/reportHelper']], // Use custom terminal reporter
  /* Shared settings for all the projects below. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for different test types */
  projects: [
    // BDD (Gherkin) UI tests running under Playwright
    {
      name: 'bdd-web',
      testDir: bddWebTestDir,
      use: {
        ...devices['Desktop Chrome'],
        channel: (process.env.PW_CHANNEL as any) || 'chrome',
        baseURL: process.env.WEB_BASE_URL || 'https://staging.lokasi.com',
        ignoreHTTPSErrors: true,
      },
    },
    // BDD (Gherkin) API tests (no browser usage)
    {
      name: 'bdd-api',
      testDir: bddApiTestDir,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.staging.lokasi.com',
        ignoreHTTPSErrors: true,
      },
    },
  ],
});
