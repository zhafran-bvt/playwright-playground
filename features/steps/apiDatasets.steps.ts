import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import jmespath from 'jmespath';
import { attachToAllure, attachApiRequest, attachApiResponse, redactedAuthHeader } from '../../utils/allureHelper';
import { SharedState } from './sharedState';

const { When, Then } = createBdd(test);

const API_BASE_URL = process.env.API_BASE_URL as string;
const DATASETS_URL = `${API_BASE_URL}/v1/datasets`;

const tokenByTest = SharedState.tokenByTest;
const idsByTest = SharedState.idsByTest;

When('I list datasets by source {string}', async ({ request, $testInfo }, source: string) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const url = `${DATASETS_URL}?source=${encodeURIComponent(source)}`;
  await attachApiRequest($testInfo, 'datasets-by-source-request', {
    url,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  await attachApiResponse($testInfo, 'datasets-by-source-response', { status: res.status(), body: json });
  expect(res.ok()).toBeTruthy();
  expect(Array.isArray(json.data)).toBeTruthy();

  const ids = (jmespath.search(json, 'data[*].id') as string[]) || [];
  const list = idsByTest.get($testInfo.testId) || [];
  idsByTest.set($testInfo.testId, list.concat(ids));

  for (const item of json.data) {
    expect(item.source).toBe(source);
  }
});

When('I list datasets with aggregation {string}', async ({ request, $testInfo }, agg: string) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const url = `${DATASETS_URL}?spatial_aggregation_type=${encodeURIComponent(agg)}`;
  await attachApiRequest($testInfo, 'datasets-by-aggregation-request', {
    url,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  const res = await request.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  await attachApiResponse($testInfo, 'datasets-by-aggregation-response', { status: res.status(), body: json });
  expect(res.ok()).toBeTruthy();
  expect(Array.isArray(json.data)).toBeTruthy();

  const ids = (jmespath.search(json, 'data[*].id') as string[]) || [];
  const list = idsByTest.get($testInfo.testId) || [];
  idsByTest.set($testInfo.testId, list.concat(ids));

  for (const item of json.data) {
    expect(item.spatial_aggregation_type).toBe(agg);
  }
});

Then('each dataset should have source {string}', async ({}, source: string) => {
  // assertions were performed in When step; this is a narrative Then
  expect(source).toBeTruthy();
});

Then('each dataset should have aggregation {string}', async ({}, agg: string) => {
  expect(agg).toBeTruthy();
});

When('I fetch schema for a random collected dataset id', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const ids = Array.from(new Set(idsByTest.get($testInfo.testId) || []));
  expect(ids.length).toBeGreaterThan(0);
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  const res = await request.get(`${DATASETS_URL}/${randomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  await attachApiRequest($testInfo, 'dataset-schema-request', {
    url: `${DATASETS_URL}/${randomId}`,
    method: 'GET',
    headers: { ...redactedAuthHeader() },
  });
  await attachApiResponse($testInfo, 'dataset-schema-response', { status: res.status(), body: json });
  // store schema length in attachment; final assertion in Then
  (json as any)._schemaLen = Array.isArray(json.schema) ? json.schema.length : 0;
  // stash latest schema into shared state map for the test if needed later
  // Not strictly needed beyond this scenario
  (global as any).__lastSchemaJson = json;
});

Then('the schema should be a non-empty array', async () => {
  const json = (global as any).__lastSchemaJson;
  expect(Array.isArray(json?.schema)).toBeTruthy();
  expect(json.schema.length).toBeGreaterThan(0);
});
