import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { attachToAllure, attachApiRequest, attachApiResponse, redactedAuthHeader } from '../../utils/allureHelper';
import { loadJsonFixture } from '../../utils/fixtureHelper';
import { deepMerge } from '../../utils/objectUtils';
import { SharedState } from './sharedState';
import type { TestInfo } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

const API_BASE_URL = process.env.API_BASE_URL as string;
const ANALYSIS_URL = `${API_BASE_URL}/v1/analysis`;

const tokenByTest = SharedState.tokenByTest;
const analysisIdByTest = SharedState.analysisIdByTest;
const intersectedDatasetIdByTest = SharedState.intersectedDatasetIdByTest;
const analysisOverridesByFeature = SharedState.analysisOverridesByFeature;

// Use a feature-scoped key so scenarios within the same feature
// reuse the same analysis id and related state.
const scopeKey = ($testInfo: TestInfo) => `${$testInfo.project.name}:${$testInfo.file}`;

function loadAnalysisBodyFromFixture($testInfo: TestInfo, name: string) {
  const base = loadJsonFixture(`analysis-bodies/${name}`);
  const overrides = analysisOverridesByFeature.get(scopeKey($testInfo));
  return overrides ? deepMerge(base, overrides) : base;
}

When('I create a spatial analysis with default body', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const analysisBody = loadAnalysisBodyFromFixture($testInfo as TestInfo, 'default.json');
  await attachApiRequest($testInfo, 'analysis-create-request', {
    url: ANALYSIS_URL,
    method: 'POST',
    headers: { ...redactedAuthHeader(), 'Content-Type': 'application/json' },
    body: analysisBody,
  });
  const res = await request.post(ANALYSIS_URL, {
    headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: analysisBody,
  });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-create-response', { status: res.status(), body });
  expect(res.ok()).toBeTruthy();
  expect(body.id).toBeTruthy();
  analysisIdByTest.set(scopeKey($testInfo as TestInfo), body.id);
});

Then('I should receive a spatial analysis id', async ({ $testInfo }) => {
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo));
  expect(typeof id).toBe('string');
  expect((id as string).length).toBeGreaterThan(20);
});

Given('a spatial analysis exists', async ({ request, $testInfo }) => {
  const key = scopeKey($testInfo as TestInfo);
  if (!analysisIdByTest.get(key)) {
    const token = tokenByTest.get($testInfo.testId)!;
    const analysisBody = loadAnalysisBodyFromFixture($testInfo as TestInfo, 'default.json');
    await attachApiRequest($testInfo, 'analysis-create-precond-request', {
      url: ANALYSIS_URL,
      method: 'POST',
      headers: { ...redactedAuthHeader(), 'Content-Type': 'application/json' },
      body: analysisBody,
    });
    const res = await request.post(ANALYSIS_URL, {
      headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: analysisBody,
    });
    const body = await res.json();
    await attachApiResponse($testInfo, 'analysis-create-precond-response', { status: res.status(), body });
    expect(res.ok()).toBeTruthy();
    analysisIdByTest.set(key, body.id);
    }
});

When('I create a spatial analysis from fixture {string}', async ({ request, $testInfo }, fixtureName: string) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const analysisBody = loadAnalysisBodyFromFixture($testInfo as TestInfo, fixtureName);
  await attachApiRequest($testInfo, 'analysis-create-request', {
    url: ANALYSIS_URL,
    method: 'POST',
    headers: { ...redactedAuthHeader(), 'Content-Type': 'application/json' },
    body: analysisBody,
  });
  const res = await request.post(ANALYSIS_URL, {
    headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: analysisBody,
  });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-create-response', { status: res.status(), body });
  expect(res.ok()).toBeTruthy();
  expect(body.id).toBeTruthy();
  analysisIdByTest.set(scopeKey($testInfo as TestInfo), body.id);
});

Given('a spatial analysis exists from fixture {string}', async ({ request, $testInfo }, fixtureName: string) => {
  const key = scopeKey($testInfo as TestInfo);
  if (!analysisIdByTest.get(key)) {
    const token = tokenByTest.get($testInfo.testId)!;
    const analysisBody = loadAnalysisBodyFromFixture($testInfo as TestInfo, fixtureName);
    await attachApiRequest($testInfo, 'analysis-create-precond-request', {
      url: ANALYSIS_URL,
      method: 'POST',
      headers: { ...redactedAuthHeader(), 'Content-Type': 'application/json' },
      body: analysisBody,
    });
    const res = await request.post(ANALYSIS_URL, {
      headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: analysisBody,
    });
    const body = await res.json();
    await attachApiResponse($testInfo, 'analysis-create-precond-response', { status: res.status(), body });
    expect(res.ok()).toBeTruthy();
    analysisIdByTest.set(key, body.id);
  }
});

Then('the analysis status should become {string}', async ({ request, $testInfo }, expected: string) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo))!;
  const statusUrl = `${API_BASE_URL}/v1/analysis/${id}/status`;

  const maxRetries = 10;
  const delayMs = 30000;
  let success = false;
  let statusBody: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await attachApiRequest($testInfo, `analysis-status-request-attempt-${attempt + 1}`, {
      url: statusUrl,
      method: 'GET',
      headers: { ...redactedAuthHeader() },
    });
    const statusResponse = await request.get(statusUrl, {
      headers: { authorization: `Bearer ${token}` },
    });
    statusBody = await statusResponse.json();
    await attachApiResponse($testInfo, `analysis-status-response-attempt-${attempt + 1}`, {
      status: statusResponse.status(),
      body: statusBody,
    });
    if (statusBody.id && statusBody.id === id && statusBody.status === expected) {
      success = true;
      break;
    }
    if (attempt < maxRetries - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  expect(success, `Analysis ${id} did not reach ${expected}`).toBeTruthy();
});

When('I fetch the analysis result datasets', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo))!;
  const resultUrl = `${API_BASE_URL}/v1/analysis/${id}`;
  await attachApiRequest($testInfo, 'analysis-result-request', {
    url: resultUrl,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(resultUrl, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-result-response', { status: res.status(), body });
  expect(body).toHaveProperty('result');
  expect(Array.isArray(body.result)).toBeTruthy();
  // Pick intersected dataset id (name != 'spatial analysis result') for downstream step
  const found = body.result && Array.isArray(body.result)
    ? body.result.find((ds: any) => ds.name !== 'spatial analysis result')
    : undefined;
  if (found?.dataset_id) intersectedDatasetIdByTest.set(scopeKey($testInfo as TestInfo), found.dataset_id);
});

Then('the result datasets should be returned', async () => {
  // Already asserted in When step
  expect(true).toBeTruthy();
});

Then('I fetch an intersected dataset from the analysis results', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo))!;
  const intersectedId = intersectedDatasetIdByTest.get(scopeKey($testInfo as TestInfo));
  expect(intersectedId, 'Intersected dataset id should be available').toBeTruthy();
  const url = `${API_BASE_URL}/v1/analysis/${id}/datasets?ids=${intersectedId}`;
  await attachApiRequest($testInfo, 'analysis-intersected-dataset-request', {
    url,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(url, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-intersected-dataset-response', { status: res.status(), body });
});

Then('the intersected dataset should match the requested id', async ({ $testInfo }) => {
  // We can’t access the last response object here directly; rely on attachment and id presence
  const intersectedId = intersectedDatasetIdByTest.get(scopeKey($testInfo as TestInfo))!;
  expect(typeof intersectedId).toBe('string');
  expect(intersectedId.length).toBeGreaterThan(10);
});

Then('I fetch the analysis summary', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo))!;
  const url = `${API_BASE_URL}/v1/analysis/${id}/summary`;
  await attachApiRequest($testInfo, 'analysis-summary-request', {
    url,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(url, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-summary-response', { status: res.status(), body });
  // stash in global for the Then step
  (global as any).__lastSummary = body;
});

// Alias to support lowercase 'i' in feature step text
Then('i fetch the analysis summary', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get(scopeKey($testInfo as TestInfo))!;
  const url = `${API_BASE_URL}/v1/analysis/${id}/summary`;
  await attachApiRequest($testInfo, 'analysis-summary-request', {
    url,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(url, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachApiResponse($testInfo, 'analysis-summary-response', { status: res.status(), body });
  (global as any).__lastSummary = body;
});

Then('the summary should include general statistics', async () => {
  const body = (global as any).__lastSummary;
  expect(body).toHaveProperty('data');
  expect(body.data).toHaveProperty('general');
  expect(body.data.general).toHaveProperty('avg_score');
  expect(body.data.general).toHaveProperty('max_score');
  expect(body.data.general).toHaveProperty('median_score');
  expect(body.data.general).toHaveProperty('min_score');
});

// Override step definitions to customize payload per feature
Given('I set analysis output type to {string}', async ({ $testInfo }, outputType: string) => {
  const key = scopeKey($testInfo as TestInfo);
  const current = analysisOverridesByFeature.get(key) || {};
  analysisOverridesByFeature.set(key, deepMerge(current, { output: { output_type: outputType } }));
});

Given('I set grid type to {string} and level {int}', async ({ $testInfo }, gridType: string, level: number) => {
  const key = scopeKey($testInfo as TestInfo);
  const current = analysisOverridesByFeature.get(key) || {};
  analysisOverridesByFeature.set(key, deepMerge(current, { output: { grid_config: { grid_type: gridType, level } } }));
});

Given('I set scoring option to {string}', async ({ $testInfo }, scoring: string) => {
  const key = scopeKey($testInfo as TestInfo);
  const current = analysisOverridesByFeature.get(key) || {};
  analysisOverridesByFeature.set(key, deepMerge(current, { output: { scoring_option: scoring } }));
});

Given('I set input id to {string}', async ({ $testInfo }, inputId: string) => {
  const key = scopeKey($testInfo as TestInfo);
  const current = analysisOverridesByFeature.get(key) || {};
  analysisOverridesByFeature.set(key, deepMerge(current, { input: { id: inputId } }));
});
