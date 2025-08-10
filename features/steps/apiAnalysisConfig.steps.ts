import { expect } from '@playwright/test';
import { createBdd, test } from 'playwright-bdd';
import { attachToAllure } from '../../utils/allureHelper';
import { SharedState } from './sharedState';
import type { TestInfo } from '@playwright/test';

const { When, Then } = createBdd(test);

const ANALYTICS_BASE_URL = process.env.ANALYTICS_BASE_URL || 'https://staging.services.bvarta.com/analytics';
const CONFIGS_URL = `${ANALYTICS_BASE_URL}/v1/analysis-configs`;

const tokenByTest = SharedState.tokenByTest;
const analysisConfigIdByFeature = SharedState.analysisConfigIdByFeature;

const scopeKey = ($testInfo: TestInfo) => `${$testInfo.project.name}:${$testInfo.file}`;

When('I list analysis configs', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const url = `${CONFIGS_URL}?per_page=25&page=1`;
  const redacted = 'Bearer <redacted>';
  await attachToAllure($testInfo, 'analysis-configs-request', {
    url,
    method: 'GET',
    headers: { accept: 'application/json', Authorization: redacted },
  });
  const res = await request.get(url, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  // Attach and stash for the Then step
  await attachToAllure($testInfo, 'analysis-configs-response', { status: res.status(), body });
  (global as any).__lastAnalysisConfigs = { status: res.status(), body, url };
  // store one id for reuse in detail scenario
  const list = Array.isArray(body?.data) ? body.data : [];
  const first = list && list.length > 0 ? list[0] : undefined;
  if (first?.id) analysisConfigIdByFeature.set(scopeKey($testInfo as TestInfo), first.id);
});

Then('the response should be 200 and include data', async ({ $testInfo }) => {
  const last = (global as any).__lastAnalysisConfigs as { status: number; body: any; url: string };
  expect(last?.status).toBe(200);
  expect(last?.body).toBeTruthy();
  expect(last.body).toHaveProperty('data');
  await attachToAllure($testInfo, 'analysis-configs-assertion', {
    url: last?.url,
    asserted_status: last?.status,
    has_data: !!last?.body?.data,
  });
});

When('I fetch analysis config detail', async ({ request, $testInfo }) => {
  const token = tokenByTest.get($testInfo.testId)!;
  const id = analysisConfigIdByFeature.get(scopeKey($testInfo as TestInfo));
  expect(id, 'Analysis config id should be available from list step').toBeTruthy();
  const url = `${CONFIGS_URL}/${id}`;
  const redacted = 'Bearer <redacted>';
  await attachToAllure($testInfo, 'analysis-config-detail-request', {
    url,
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: redacted },
  });
  const res = await request.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await res.json();
  await attachToAllure($testInfo, 'analysis-config-detail-response', { status: res.status(), body });
  (global as any).__lastAnalysisConfigDetail = { status: res.status(), body, id, url };
});

Then('the response should be 200 and id should match', async ({ $testInfo }) => {
  const last = (global as any).__lastAnalysisConfigDetail as { status: number; body: any; id: string; url: string };
  expect(last?.status).toBe(200);
  expect(last?.body).toBeTruthy();
  expect(last.body).toHaveProperty('id');
  expect(last.body.id).toBe(last.id);
  expect(last.body).toHaveProperty('analysis_output');
  await attachToAllure($testInfo, 'analysis-config-detail-assertion', {
    url: last?.url,
    asserted_status: last?.status,
    requested_id: last?.id,
    response_id: last?.body?.id,
    has_analysis_output: !!last?.body?.analysis_output,
  });
});
