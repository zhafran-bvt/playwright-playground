import { defineConfig, devices } from '@playwright/test';
import TerminalReporter from './utils/reportHelper'; // Custom reporter for terminal output

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
    // Web UI Tests
    {
      name: 'Google Chrome',
      testDir: './tests/web', // Specify web test directory
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use Chrome browser
        baseURL: 'https://staging.lokasi.com' // Set your web base URL
      },
    },
    {
      name: 'Microsoft Edge',
      testDir: './tests/web',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge', // Use Edge browser
        baseURL: 'https://staging.lokasi.com'
      },
    },

    // API Tests
    {
      name: 'api-tests',
      testDir: './tests/api', // Specify API test directory
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.staging.lokasi.com',
        ignoreHTTPSErrors: true, // <--- Add this line
      },
    },
  ],
});