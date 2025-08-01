import { test, expect } from '@playwright/test';
import { getAccessToken } from '../../utils/authHelper';
import { attachToAllure } from '../../utils/allureHelper';
import jmespath from 'jmespath';

const API_BASE_URL = process.env.API_BASE_URL;
const DATASETS_URL = `${API_BASE_URL}/v1/datasets`;

test.describe('Datasets APIs', () => {
  test.describe.configure({ mode: 'serial' }); 

  let accessToken: string;
  let idDatasets: string[] = [];

  test.beforeAll(async ({ request }) => {
    accessToken = await getAccessToken(request);
  });

  test('Should get BVT datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?source=bvt`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'BVT Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    // Use jmespath to extract all ids and add to idDatasets
    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.source).toBe('bvt');
    }
  });

  test('Should get User datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?source=user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'User Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.source).toBe('user');
    }
  });

  test('Should get H3 datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?spatial_aggregation_type=H3`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'H3 Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.spatial_aggregation_type).toBe('H3');
    }
  });

  test('Should get POI datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?spatial_aggregation_type=POI`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'POI Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.spatial_aggregation_type).toBe('POI');
    }
  });

  test('Should get Thematic datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?spatial_aggregation_type=adm_area`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'Thematic Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.spatial_aggregation_type).toBe('adm_area');
    }
  });

  test('Should get Geohash datasets', async ({ request }, testInfo) => {
    const res = await request.get(`${DATASETS_URL}?spatial_aggregation_type=Geohash`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, 'Geohash Datasets Response', JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.data)).toBeTruthy();

    const ids = jmespath.search(json, 'data[*].id') as string[] || [];
    console.log('Extracted IDs:', ids);
    idDatasets.push(...ids);

    for (const item of json.data) {
      expect(item.spatial_aggregation_type).toBe('Geohash');
    }
  });

  test('Should get datasets schema for a random collected id', async ({ request }, testInfo) => {
    const uniqueIds = Array.from(new Set(idDatasets));
    expect(uniqueIds.length).toBeGreaterThan(0);

    // Pick a random id from the unique ids
    const randomId = uniqueIds[Math.floor(Math.random() * uniqueIds.length)];
    const res = await request.get(`${DATASETS_URL}/${randomId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    await attachToAllure(testInfo, `Schema for dataset ${randomId}`, JSON.stringify(json, null, 2), 'application/json');
    expect(res.ok()).toBeTruthy();
    expect(Array.isArray(json.schema)).toBeTruthy();
    expect(json.schema.length).toBeGreaterThan(0); // Optionally ensure not empty
  });
});