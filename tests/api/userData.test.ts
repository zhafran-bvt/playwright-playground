import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getAccessToken } from '../../utils/authHelper';
import { attachToAllure } from '../../utils/allureHelper';

const API_BASE_URL = process.env.API_BASE_URL;
const IMPORT_URL = `${API_BASE_URL}/v1/datasets/import`;
const OPERATIONS_URL = `${API_BASE_URL}/v1/datasets/operations`;

let operationId: string | undefined;

test.describe('Dataset Import API', () => {
  test('should upload XLSX dataset file', async ({ request }, testInfo) => {
    const accessToken = await getAccessToken(request);
    const datasetName = 'Sample XLSX';
    const filePath = path.resolve(__dirname, '../fixtures/sample-geohash-dataset.xlsx');
    if (!fs.existsSync(filePath)) throw new Error(`Test file not found: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);

    // Attach request to Allure
    await attachToAllure(testInfo, 'import-xlsx-request', {
      url: IMPORT_URL,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: { name: datasetName, file: path.basename(filePath) },
    });

    const uploadRes = await request.post(IMPORT_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        name: datasetName,
        file: {
          name: path.basename(filePath),
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: fileBuffer,
        },
      },
    });

    // Attach response to Allure
    await attachToAllure(testInfo, 'import-xlsx-response', {
      status: uploadRes.status(),
      body: await uploadRes.json(),
    });

    expect(uploadRes.ok()).toBeTruthy();
    const uploadJson = await uploadRes.json();
    operationId = uploadJson.operation_id;
    expect(operationId).toBeTruthy();
    console.log('XLSX Operation ID:', operationId);
  });

  test('should upload CSV dataset file', async ({ request }, testInfo) => {
    const accessToken = await getAccessToken(request);
    const datasetName = 'Sample CSV';
    const filePath = path.resolve(__dirname, '../fixtures/sample-geohash-dataset.csv');
    if (!fs.existsSync(filePath)) throw new Error(`Test file not found: ${filePath}`);
    const fileBuffer = fs.readFileSync(filePath);

    await attachToAllure(testInfo, 'import-csv-request', {
      url: IMPORT_URL,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: { name: datasetName, file: path.basename(filePath) },
    });

    const uploadRes = await request.post(IMPORT_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        name: datasetName,
        file: {
          name: path.basename(filePath),
          mimeType: 'text/csv',
          buffer: fileBuffer,
        },
      },
    });

    await attachToAllure(testInfo, 'import-csv-response', {
      status: uploadRes.status(),
      body: await uploadRes.json(),
    });

    expect(uploadRes.ok()).toBeTruthy();
    const uploadJson = await uploadRes.json();
    operationId = uploadJson.operation_id;
    expect(operationId).toBeTruthy();
    console.log('CSV Operation ID:', operationId);
  });

  test('should check import operation status with retry', async ({ request }, testInfo) => {
    const accessToken = await getAccessToken(request);
    expect(operationId).toBeTruthy();

    console.log('Checking status for operation ID:', operationId);

    // Poll for status == SUCCESS and attach each poll to Allure
    await expect.poll(async () => {
      await attachToAllure(testInfo, 'import-status-request', {
        url: `${OPERATIONS_URL}/${operationId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const res = await request.get(`${OPERATIONS_URL}/${operationId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      await attachToAllure(testInfo, 'import-status-response', {
        status: res.status(),
        body: json,
      });
      console.log('Current status:', json.status);
      return json.status;
    }, {
      timeout: 30_000,
      intervals: [1000, 2000, 2000, 3000],
    }).toBe('SUCCESS');

    // Final status fetch for assertion and allure
    await attachToAllure(testInfo, 'import-final-status-request', {
      url: `${OPERATIONS_URL}/${operationId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await request.get(`${OPERATIONS_URL}/${operationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const statusJson = await res.json();
    await attachToAllure(testInfo, 'import-final-status-response', {
      status: res.status(),
      body: statusJson,
    });

    console.log('Final Status response:', statusJson);
    expect(statusJson.import_count).toBeDefined();
    expect(statusJson.import_count.total).toBeGreaterThan(0);
  });
});