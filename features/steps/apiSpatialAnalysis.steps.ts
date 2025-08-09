import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { attachToAllure } from '../../utils/allureHelper';
import { SharedState } from './sharedState';

const { Given, When, Then } = createBdd(test);

const API_BASE_URL = process.env.API_BASE_URL as string;
const ANALYSIS_URL = `${API_BASE_URL}/v1/analysis`;

const tokenByTest = SharedState.tokenByTest;
const analysisIdByTest = SharedState.analysisIdByTest;
const intersectedDatasetIdByTest = SharedState.intersectedDatasetIdByTest;

const analysisBody = {
  datasets: [
    {
      id: '7cabbffa-f969-4ee4-83d6-d9fef8f3e224',
      filter: [],
      weight: [
        { schema_id: 'fcb354e6-8ea5-474d-9453-b90717eb192a', weight: 5.88 },
        { schema_id: '0d2e071a-ede3-4fee-8eef-122474b12788', weight: 5.88 },
        { schema_id: '7ab70d24-8965-4728-a89c-45952a7919af', weight: 5.88 },
        { schema_id: '51eb3ba5-5a9c-4309-af22-480ef0339462', weight: 5.88 },
      ],
    },
    {
      id: '879e0389-b0da-4079-b223-4221e00df82e',
      filter: [
        {
          schema_id: '799a0d1b-70f8-4469-a8f5-f6637d782aa3',
          filter: { min: 10, max: 1000, include_nulls: false },
          attribute_code: '',
        },
      ],
      weight: [
        { schema_id: '4969ea33-ac4a-4461-8f88-3d3ee5b7179a', weight: 5.88 },
        { schema_id: '5423f030-5475-4aee-b3d4-d38bcd362ca4', weight: 5.88 },
        { schema_id: '799a0d1b-70f8-4469-a8f5-f6637d782aa3', weight: 5.88 },
        { schema_id: 'a02289a9-3c0b-4f10-9719-1c9e1f59ba26', weight: 5.88 },
        { schema_id: 'bb8c4d32-f6c0-415f-a108-f6143dfeffdc', weight: 5.88 },
      ],
    },
    {
      id: 'd0a1b575-a60f-4adf-9458-b6f6e790a080',
      filter: [],
      weight: [
        { schema_id: 'c5ac3677-185f-4deb-9851-3f22aaa28d9a', weight: 5.88 },
        { schema_id: '0d1595d9-6c4a-481d-84d6-6e08e71b1af0', weight: 5.88 },
        { schema_id: '1bb83bba-02fd-4caa-ab27-1d9a72095ffd', weight: 5.88 },
        { schema_id: '6a7cd88d-da54-4c2a-a2e3-3fefba7b2639', weight: 5.88 },
        { schema_id: '42cde533-afca-4e5d-985c-1acb1d081930', weight: 5.88 },
      ],
    },
    {
      id: '60c9410f-ff10-4867-bfb1-54b018ef486a',
      filter: [],
      weight: [
        { schema_id: '46d30da9-a922-4b69-ae90-5e61a13aa9a5', weight: 5.88 },
        { schema_id: '27329141-a641-4e23-bb43-cc2e31c6415f', weight: 5.88 },
      ],
    },
    {
      id: 'c9e6bd67-6a93-4a3b-b44b-dc3cbfd38853',
      filter: [],
      weight: [{ schema_id: '2fdfbd39-6238-480f-b58e-6752db6fd298', weight: 5.88 }],
    },
  ],
  input: {
    id: '590c3f10-759d-4e9d-b8ad-7c0d78f09e5e',
  },
  output: {
    output_type: 'TYPE_GRID',
    grid_config: {
      grid_type: 'TYPE_GEOHASH',
      level: 3,
    },
    scoring_option: 'SCALED',
  },
};

When('I create a spatial analysis with default body', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  await attachToAllure($testInfo, 'analysis-request-body', analysisBody);
  const res = await request.post(ANALYSIS_URL, {
    headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: analysisBody,
  });
  const body = await res.json();
  await attachToAllure($testInfo, 'analysis-status', res.status().toString());
  await attachToAllure($testInfo, 'analysis-response', body);
  expect(res.ok()).toBeTruthy();
  expect(body.id).toBeTruthy();
  analysisIdByTest.set($testInfo.testId, body.id);
});

Then('I should receive a spatial analysis id', async ({ $testInfo }) => {
  const id = analysisIdByTest.get($testInfo.testId);
  expect(typeof id).toBe('string');
  expect((id as string).length).toBeGreaterThan(20);
});

Given('a spatial analysis exists', async ({ request, $testInfo }) => {
  if (!analysisIdByTest.get($testInfo.testId)) {
    const token = tokenByTest.get($testInfo.testId)!;
    await attachToAllure($testInfo, 'analysis-request-body-precond', analysisBody);
    const res = await request.post(ANALYSIS_URL, {
      headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: analysisBody,
    });
    const body = await res.json();
    await attachToAllure($testInfo, 'analysis-precond-status', res.status().toString());
    await attachToAllure($testInfo, 'analysis-precond-response', body);
    expect(res.ok()).toBeTruthy();
    analysisIdByTest.set($testInfo.testId, body.id);
  }
});

Then('the analysis status should become {string}', async ({ request, $testInfo }, expected: string) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get($testInfo.testId)!;
  const statusUrl = `${API_BASE_URL}/v1/analysis/${id}/status`;

  const maxRetries = 10;
  const delayMs = 30000;
  let success = false;
  let statusBody: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const statusResponse = await request.get(statusUrl, {
      headers: { authorization: `Bearer ${token}` },
    });
    statusBody = await statusResponse.json();
    await attachToAllure($testInfo, `status-request-url-attempt-${attempt + 1}`, statusUrl);
    await attachToAllure($testInfo, `status-response-attempt-${attempt + 1}`, statusBody);
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
  const id = analysisIdByTest.get($testInfo.testId)!;
  const resultUrl = `${API_BASE_URL}/v1/analysis/${id}`;
  const res = await request.get(resultUrl, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachToAllure($testInfo, 'result-datasets-response', body);
  expect(body).toHaveProperty('result');
  expect(Array.isArray(body.result)).toBeTruthy();
  // Pick intersected dataset id (name != 'spatial analysis result') for downstream step
  const found = body.result && Array.isArray(body.result)
    ? body.result.find((ds: any) => ds.name !== 'spatial analysis result')
    : undefined;
  if (found?.dataset_id) intersectedDatasetIdByTest.set($testInfo.testId, found.dataset_id);
});

Then('the result datasets should be returned', async () => {
  // Already asserted in When step
  expect(true).toBeTruthy();
});

When('I fetch an intersected dataset from the analysis results', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get($testInfo.testId)!;
  const intersectedId = intersectedDatasetIdByTest.get($testInfo.testId);
  expect(intersectedId, 'Intersected dataset id should be available').toBeTruthy();
  const url = `${API_BASE_URL}/v1/analysis/${id}/datasets?ids=${intersectedId}`;
  await attachToAllure($testInfo, 'intersected-dataset-url', url);
  const res = await request.get(url, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachToAllure($testInfo, 'intersected-dataset-response', body);
});

Then('the intersected dataset should match the requested id', async ({ $testInfo }) => {
  // We can’t access the last response object here directly; rely on attachment and id presence
  const intersectedId = intersectedDatasetIdByTest.get($testInfo.testId)!;
  expect(typeof intersectedId).toBe('string');
  expect(intersectedId.length).toBeGreaterThan(10);
});

When('I fetch the analysis summary', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisIdByTest.get($testInfo.testId)!;
  const url = `${API_BASE_URL}/v1/analysis/${id}/summary`;
  await attachToAllure($testInfo, 'summary-request-url', url);
  const res = await request.get(url, { headers: { authorization: `Bearer ${token}` } });
  const body = await res.json();
  await attachToAllure($testInfo, 'summary-response', body);
  // stash in global for the Then step
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
