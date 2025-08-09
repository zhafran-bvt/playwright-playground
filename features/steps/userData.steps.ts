import path from 'path';
import fs from 'fs';
import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { getAccessToken } from '../../utils/authHelper';
import { attachToAllure } from '../../utils/allureHelper';
import { SharedState } from './sharedState';

const { Given, When, Then } = createBdd(test);

const API_BASE_URL = process.env.API_BASE_URL as string;
const IMPORT_URL = `${API_BASE_URL}/v1/datasets/import`;
const OPERATIONS_URL = `${API_BASE_URL}/v1/datasets/operations`;

// Store per-test data safely when running in parallel
// Use shared state across API BDD steps
const tokenByTest = SharedState.tokenByTest;
const opIdByTest = SharedState.opIdByTest;

Given('I have a valid API access token', async ({ request, $testInfo }) => {
  const token = await getAccessToken(request);
  tokenByTest.set($testInfo.testId, token);
});

When(
  'I upload dataset {string} from file {string} with mime {string}',
  async ({ request, $testInfo }, datasetName: string, filename: string, mimeType: string) => {
    const token = tokenByTest.get($testInfo.testId);
    if (!token) throw new Error('Access token not found for this test');

    const filePath = path.resolve(__dirname, '../../tests/fixtures', filename);
    if (!fs.existsSync(filePath)) throw new Error(`Test file not found: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);

    await attachToAllure($testInfo, 'import-request', {
      url: IMPORT_URL,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      multipart: { name: datasetName, file: path.basename(filePath) },
    });

    const res = await request.post(IMPORT_URL, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: {
        name: datasetName,
        file: {
          name: path.basename(filePath),
          mimeType,
          buffer: fileBuffer,
        },
      },
    });

    await attachToAllure($testInfo, 'import-response', {
      status: res.status(),
      body: await res.json(),
    });

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const operationId = json.operation_id as string;
    expect(operationId).toBeTruthy();
    opIdByTest.set($testInfo.testId, operationId);
  }
);

Then('the import operation should succeed', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId);
  const operationId = opIdByTest.get($testInfo.testId);
  if (!token || !operationId) throw new Error('Missing token or operation ID');

  await expect.poll(async () => {
    await attachToAllure($testInfo, 'import-status-request', {
      url: `${OPERATIONS_URL}/${operationId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await request.get(`${OPERATIONS_URL}/${operationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    await attachToAllure($testInfo, 'import-status-response', {
      status: res.status(),
      body: json,
    });
    return json.status;
  }, { timeout: 30_000, intervals: [1000, 2000, 2000, 3000] }).toBe('SUCCESS');

  const res = await request.get(`${OPERATIONS_URL}/${operationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statusJson = await res.json();
  await attachToAllure($testInfo, 'import-final-status-response', {
    status: res.status(),
    body: statusJson,
  });
  expect(statusJson.import_count).toBeDefined();
  expect(statusJson.import_count.total).toBeGreaterThan(0);
});
