# Playwright + BDD Playground

Automated web UI and API tests for the Lokasi Intelligence platform using Playwright with BDD (Gherkin) via `playwright-bdd`. The suite generates Playwright specs from feature files and runs them across two projects: UI (`bdd-web`) and API (`bdd-api`).

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [BDD (Cucumber) Usage](#bdd-cucumber-usage)
- [Test Examples](#test-examples)
- [Custom Helpers](#custom-helpers)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- BDD-first: write scenarios in Gherkin under `features/**/*.feature`.
- Two projects: `bdd-web` (UI) and `bdd-api` (API), split by tags.
- Screenshots per step (UI): after each step (`@web` only) to aid debugging.
- Request/Response attachments (API): all API calls are attached to Allure.
- Allure reporting: generate and deploy rich HTML reports.
- Env-configurable: credentials and endpoints via `.env` or CI secrets.

---

## Project Structure

```
playwright-playground/
├── playwright.config.ts        # Playwright + BDD projects (bdd-web, bdd-api)
├── features/                   # Gherkin features + step definitions
│   ├── *.feature               # Feature files (@web or @api tagged)
│   └── steps/*.ts              # Step definitions
├── tests/bdd/                  # Generated UI specs (gitignored)
├── tests/api/bdd/              # Generated API specs (gitignored)
├── utils/                      # Allure + auth + custom reporter
│   ├── allureHelper.ts
│   ├── authHelper.ts
│   └── reportHelper.ts
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

### Test Commands

```bash
# Generate BDD specs, run both projects
npm run test            # or: npm run test:bdd:all

# UI BDD only
npm run test:bdd

# API BDD only
npm run test:bdd:api

# Just regenerate BDD specs
npm run bdd:gen
```

### Allure Report

```bash
# After running tests (results in ./allure-results)
npm run allure:generate
npm run allure:open
```

---

## BDD (Cucumber) Usage

Features under `features/**` are split by tags:
- `@web`: included in `bdd-web` (UI) project
- `@api`: included in `bdd-api` project

Generated tests go to `tests/bdd/**` (UI) and `tests/api/bdd/**` (API) at runtime and are gitignored.

`.env` is loaded automatically. Required keys:
```
TEST_USER=...
TEST_PASSWORD=...
API_BASE_URL=...
API_CLIENT_ID=...
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

## Utilities

- `utils/allureHelper.ts` — Attach strings/JSON/Buffers to Allure.
- `utils/authHelper.ts` — Obtain API access tokens in tests.
- `utils/reportHelper.ts` — Concise terminal summary reporter.

UI screenshots after every BDD step are handled in `features/steps/hooks.ts` and applied only to `@web` scenarios.

---

## Contributing

Feel free to open issues or submit pull requests if you find bugs or want to add new features!

---

> _Made with ❤️ using [Playwright](https://playwright.dev/)_
