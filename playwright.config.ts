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
  /* Increase overall timeouts to accommodate slower envs */
  // Global max time for the whole run (1 hour)
  globalTimeout: 60 * 60 * 1000,
  // Default per-test timeout (applies unless overridden by project)
  timeout: 90 * 1000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['allure-playwright'], ['./utils/reportHelper']], // Use custom terminal reporter
  // Default expect configuration (belongs at top-level, not under `use`)
  expect: { timeout: 30_000 },
  /* Shared settings for all the projects below. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // Enable tracing for all tests to ease debugging
    trace: 'on',
  },

  /* Configure projects for different test types */
  projects: [
    // BDD (Gherkin) UI tests running under Playwright
    {
      name: 'bdd-web',
      testDir: bddWebTestDir,
      // UI can be a bit slower on staging; modestly increase timeouts
      timeout: 120 * 1000,
      use: {
        ...devices['Desktop Chrome'],
        channel: (process.env.PW_CHANNEL as any) || 'chrome',
        baseURL: process.env.WEB_BASE_URL || 'https://staging.lokasi.com',
        ignoreHTTPSErrors: true,
        // Allow slower navigations and actions on shared envs
        actionTimeout: 30_000,
        navigationTimeout: 60_000,
      },
    },
    // BDD (Gherkin) API tests (no browser usage)
    {
      name: 'bdd-api',
      testDir: bddApiTestDir,
      // Ensure API scenarios run in a single worker so shared state persists
      workers: 1,
      // Spatial analysis polling can take minutes; allow generous timeout
      timeout: 10 * 60 * 1000,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.staging.lokasi.com',
        ignoreHTTPSErrors: true,
      },
    },
  ],
});
