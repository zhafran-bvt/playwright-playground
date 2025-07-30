# Playwright Playground

A collection of automated tests and utilities using [Playwright](https://playwright.dev/) for web UI and API testing, focused on the _Lokasi Intelligence_ platform. This repository demonstrates advanced Playwright usage, best practices, and custom helpers for robust, maintainable testing.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Test Examples](#test-examples)
- [Custom Helpers](#custom-helpers)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Web UI Automated Tests**: Automated E2E tests for the _Lokasi Intelligence_ web app, including Data Explorer and Spatial Analysis modules.
- **API Testing**: Automated API tests for spatial analysis and authentication endpoints.
- **Playwright Multi-Project Config**: Runs tests across multiple browsers (Chrome, Edge) and for both API and UI.
- **Custom Test Utilities**: Helpers for login, screenshot capture, and Allure reporting integration.
- **Environment Configurable**: Easily switch targets and credentials via environment variables.

---

## Project Structure

```
playwright-playground/
├── playwright.config.ts        # Playwright multi-project configuration
├── tests/
│   ├── web/                   # Web UI Playwright tests
│   ├── api/                   # API Playwright tests
├── tests-examples/            # Example Playwright test specs (e.g. Todo app)
├── utils/                     # Custom helper utilities
└── ...
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Chrome/Edge browser installed

### Installation

```bash
# Clone the repo
git clone https://github.com/zhafran-bvt/playwright-playground.git
cd playwright-playground

# Install dependencies
npm install
# or
yarn install
```

### Environment Setup

Create a `.env` file in the root directory:

```
TEST_USER=your@email.com
TEST_PASSWORD=your_password
API_BASE_URL=https://api.staging.lokasi.com
API_CLIENT_ID=your_client_id
```

---

## Usage

### Run All Tests

```bash
npx playwright test
```

### Run Only Web or API Tests

```bash
npx playwright test --project="Google Chrome"
npx playwright test --project="api-tests"
```

### Generate Allure Report

```bash
npx playwright test --reporter=allure-playwright
npx allure serve ./allure-results
```

---

## Test Examples

- **Web UI:**
  - Login to _Lokasi Intelligence_
  - Use Data Explorer to add datasets (e.g., "Thematic Village SES 2022")
  - Perform spatial analysis using various configurations
  - Automated screenshots and Allure attachments

- **API:**
  - Authenticate and fetch access tokens
  - Run spatial analysis jobs and verify results
  - Validate summary statistics from the API


---

## Custom Helpers

- `utils/loginHelper.ts` — Programmatic login for web tests using supplied or `.env` credentials.
- `utils/screenshotHelper.ts` — Consistent screenshot capture and file naming for test artifacts.
- `utils/allureHelper.ts` — Allure reporting attachments for traceability.

---

## Contributing

Feel free to open issues or submit pull requests if you find bugs or want to add new features!

---

> _Made with ❤️ using [Playwright](https://playwright.dev/)_
