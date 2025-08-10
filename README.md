# Playwright + BDD Playground

Automated Web UI and API tests for the Lokasi Intelligence platform using Playwright + BDD (Gherkin) via `playwright-bdd`. Feature files are compiled into Playwright tests and run across two projects: UI (`bdd-web`) and API (`bdd-api`).

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [BDD (Cucumber) Usage](#bdd-cucumber-usage)
- [Spatial Analysis Payloads](#spatial-analysis-payloads)
- [Reporting](#reporting)
- [Test Examples](#test-examples)
- [Utilities](#utilities)
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
├── features/
│   ├── api/                    # API feature files (@api)
│   │   ├── api_auth.feature
│   │   ├── api_datasets.feature
│   │   ├── api_analysis_config.feature
│   │   └── api_spatial_analysis_full.feature
│   ├── web/                    # Web/UI feature files (@web)
│   │   ├── login.feature
│   │   ├── logout.feature
│   │   ├── data_explorer.feature
│   │   └── spatial_analysis.feature
│   └── steps/*.ts              # Step definitions (shared)
├── tests/bdd/                  # Generated UI specs (gitignored)
├── tests/api/bdd/              # Generated API specs (gitignored)
├── tests/fixtures/             # Test fixtures (files, JSON payloads)
│   └── analysis-bodies/*.json  # Spatial analysis payload templates
├── utils/                      # Helpers (auth, allure, reporter, etc.)
│   ├── allureHelper.ts
│   ├── authHelper.ts
│   ├── fixtureHelper.ts
│   ├── objectUtils.ts
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

# Optional (defaults in code)
# PW_CHANNEL=chrome
# WEB_BASE_URL=https://staging.lokasi.com
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

# List tests without running
npm run bdd:list           # UI
npm run bdd:list:api       # API
```

## Reporting

```bash
# After running tests (results in ./allure-results)
npm run allure:generate
npm run allure:open

Attachments
- API steps attach request/response details to Allure with sensitive `Authorization` redacted.
- Web steps attach a screenshot after every step tagged `@web`.
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

## Spatial Analysis Payloads

Payload templates live under `tests/fixtures/analysis-bodies/*.json`.

Create using the default payload:
- When I create a spatial analysis with default body

Create using a named fixture:
- When I create a spatial analysis from fixture "my_scenario.json"

Customize parts of the payload without changing fixtures (deep-merged overrides):
- Given I set analysis output type to "TYPE_GRID"            (or "TYPE_SITE_PROFILING")
- Given I set grid type to "TYPE_GEOHASH" and level 3       (or "TYPE_H3" and level 7)
- Given I set scoring option to "SCALED"
- Given I set input id to "<uuid>"

Full-flow scenario example (single scenario):
- When I create → Then id received → Then status SUCCESS → Then fetch results → Then fetch intersected → Then fetch summary


---

## Utilities

- `utils/allureHelper.ts` — Attach strings/JSON/Buffers to Allure; standardized API request/response helpers.
- `utils/authHelper.ts` — Obtain API access tokens; attaches redacted auth call to Allure.
- `utils/fixtureHelper.ts` — Load JSON fixtures from `tests/fixtures`.
- `utils/objectUtils.ts` — Small deep-merge helper for payload overrides.
- `utils/reportHelper.ts` — Concise terminal summary reporter.

UI screenshots after every BDD step are handled in `features/steps/hooks.ts` and applied only to `@web` scenarios.

CI
- See `.github/workflows/playwright.yml` for running both projects and deploying Allure to Netlify.

---

## Contributing

Feel free to open issues or submit pull requests if you find bugs or want to add new features!

---

> _Made with ❤️ using [Playwright](https://playwright.dev/)_
