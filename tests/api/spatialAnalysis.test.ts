import { test as base, expect, APIRequestContext } from '@playwright/test';
import { getAccessToken } from '../../utils/authHelper';
import { attachToAllure } from '../../utils/allureHelper';

const API_BASE_URL = process.env.API_BASE_URL;
const ANALYSIS_URL = `${API_BASE_URL}/v1/analysis`;

const analysisBody = {
  datasets: [
    {
      id: "7cabbffa-f969-4ee4-83d6-d9fef8f3e224",
      filter: [],
      weight: [
        { schema_id: "fcb354e6-8ea5-474d-9453-b90717eb192a", weight: 5.88 },
        { schema_id: "0d2e071a-ede3-4fee-8eef-122474b12788", weight: 5.88 },
        { schema_id: "7ab70d24-8965-4728-a89c-45952a7919af", weight: 5.88 },
        { schema_id: "51eb3ba5-5a9c-4309-af22-480ef0339462", weight: 5.88 }
      ]
    },
    {
      id: "879e0389-b0da-4079-b223-4221e00df82e",
      filter: [
        {
          schema_id: "799a0d1b-70f8-4469-a8f5-f6637d782aa3",
          filter: { min: 10, max: 1000, include_nulls: false },
          attribute_code: ""
        }
      ],
      weight: [
        { schema_id: "4969ea33-ac4a-4461-8f88-3d3ee5b7179a", weight: 5.88 },
        { schema_id: "5423f030-5475-4aee-b3d4-d38bcd362ca4", weight: 5.88 },
        { schema_id: "799a0d1b-70f8-4469-a8f5-f6637d782aa3", weight: 5.88 },
        { schema_id: "a02289a9-3c0b-4f10-9719-1c9e1f59ba26", weight: 5.88 },
        { schema_id: "bb8c4d32-f6c0-415f-a108-f6143dfeffdc", weight: 5.88 }
      ]
    },
    {
      id: "d0a1b575-a60f-4adf-9458-b6f6e790a080",
      filter: [],
      weight: [
        { schema_id: "c5ac3677-185f-4deb-9851-3f22aaa28d9a", weight: 5.88 },
        { schema_id: "0d1595d9-6c4a-481d-84d6-6e08e71b1af0", weight: 5.88 },
        { schema_id: "1bb83bba-02fd-4caa-ab27-1d9a72095ffd", weight: 5.88 },
        { schema_id: "6a7cd88d-da54-4c2a-a2e3-3fefba7b2639", weight: 5.88 },
        { schema_id: "42cde533-afca-4e5d-985c-1acb1d081930", weight: 5.88 }
      ]
    },
    {
      id: "60c9410f-ff10-4867-bfb1-54b018ef486a",
      filter: [],
      weight: [
        { schema_id: "46d30da9-a922-4b69-ae90-5e61a13aa9a5", weight: 5.88 },
        { schema_id: "27329141-a641-4e23-bb43-cc2e31c6415f", weight: 5.88 }
      ]
    },
    {
      id: "c9e6bd67-6a93-4a3b-b44b-dc3cbfd38853",
      filter: [],
      weight: [
        { schema_id: "2fdfbd39-6238-480f-b58e-6752db6fd298", weight: 5.88 }
      ]
    }
  ],
  input: {
    id: "590c3f10-759d-4e9d-b8ad-7c0d78f09e5e"
  },
  output: {
    output_type: "TYPE_GRID",
    grid_config: {
      grid_type: "TYPE_GEOHASH",
      level: 3
    },
    scoring_option: "SCALED"
  }
};

type AnalysisFixtures = {
  accessToken: string;
  analysisId: string;
  waitForAnalysisSuccess: () => Promise<void>;
  intersectedDatasetId: string;
};

export const test = base.extend<AnalysisFixtures>({
  accessToken: async ({ request }, use) => {
    const token = await getAccessToken(request);
    await use(token);
  },

  analysisId: async ({ request, accessToken }, use, testInfo) => {
    await attachToAllure(testInfo, 'analysis-request-body', analysisBody);
    const res = await request.post(ANALYSIS_URL, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: analysisBody,
    });
    const body = await res.json();
    await attachToAllure(testInfo, 'analysis-status', res.status().toString());
    await attachToAllure(testInfo, 'analysis-response', body);
    await use(body.id);
  },

  waitForAnalysisSuccess: async ({ request, accessToken, analysisId }, use, testInfo) => {
    const statusUrl = `${API_BASE_URL}/v1/analysis/${analysisId}/status`;
    const maxRetries = 10;
    const delayMs = 30000;
    let statusBody: any;
    let success = false;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const statusResponse = await request.get(statusUrl, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      statusBody = await statusResponse.json();
      await attachToAllure(testInfo, `status-request-url-attempt-${attempt + 1}`, statusUrl);
      await attachToAllure(testInfo, `status-response-attempt-${attempt + 1}`, statusBody);

      if (statusBody.id && statusBody.id === analysisId && statusBody.status === 'SUCCESS') {
        success = true;
        break;
      }
      if (attempt < maxRetries - 1) await new Promise(r => setTimeout(r, delayMs));
    }

    expect(success, `Analysis with id=${analysisId} did not reach SUCCESS status within ${maxRetries} attempts`).toBeTruthy();
    expect(statusBody.id).toBe(analysisId);
    expect(statusBody.status).toBe('SUCCESS');
    await use(() => Promise.resolve());
  },

  intersectedDatasetId: async ({ request, accessToken, analysisId, waitForAnalysisSuccess }, use, testInfo) => {
    await waitForAnalysisSuccess();
    const resultUrl = `${API_BASE_URL}/v1/analysis/${analysisId}`;
    const response = await request.get(resultUrl, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const body = await response.json();
    await attachToAllure(testInfo, 'result-datasets-response', body);

    const found = body.result && Array.isArray(body.result)
      ? body.result.find((ds: any) => ds.name !== 'spatial analysis result')
      : undefined;
    expect(found, 'Intersected dataset not found').toBeTruthy();
    await attachToAllure(testInfo, 'intersected-dataset-id', found.dataset_id);

    await use(found.dataset_id);
  }
});

// Increase the timeout for all tests in this file to accommodate long polling
test.setTimeout(350000);

test.describe('Spatial Analysis API (fixture version)', () => {
  test('Should create spatial analysis', async ({ analysisId }) => {
    expect(analysisId).toBeTruthy();
    expect(typeof analysisId).toBe('string');
    expect(analysisId.length).toBeGreaterThan(20);
  });

  test('Should check analysis status (with retry)', async ({ waitForAnalysisSuccess }) => {
    await waitForAnalysisSuccess();
  });

  test('Should get result datasets', async ({ request, accessToken, analysisId, waitForAnalysisSuccess }, testInfo) => {
    await waitForAnalysisSuccess();
    const resultUrl = `${API_BASE_URL}/v1/analysis/${analysisId}`;
    const response = await request.get(resultUrl, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const body = await response.json();
    await attachToAllure(testInfo, 'result-datasets-response', body);
    expect(body).toHaveProperty('result');
    expect(Array.isArray(body.result)).toBeTruthy();
  });

  test('Should get intersected dataset', async ({ request, accessToken, analysisId, intersectedDatasetId, waitForAnalysisSuccess }, testInfo) => {
    await waitForAnalysisSuccess();
    const url = `${API_BASE_URL}/v1/analysis/${analysisId}/datasets?ids=${intersectedDatasetId}`;
    await attachToAllure(testInfo, 'intersected-dataset-url', url);

    const response = await request.get(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    const body = await response.json();
    await attachToAllure(testInfo, 'intersected-dataset-response', body);

    expect(Array.isArray(body.result)).toBeTruthy();
    expect(body.result[0]).toHaveProperty('dataset_id', intersectedDatasetId);
  });

  test('Should get analysis summary', async ({ request, accessToken, analysisId, waitForAnalysisSuccess }, testInfo) => {
    await waitForAnalysisSuccess();
    const summaryUrl = `${API_BASE_URL}/v1/analysis/${analysisId}/summary`;
    await attachToAllure(testInfo, 'summary-request-url', summaryUrl);

    const response = await request.get(summaryUrl, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    const body = await response.json();
    await attachToAllure(testInfo, 'summary-response', body);

    // Validate general keys exist
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('general');
    expect(body.data.general).toHaveProperty('avg_score');
    expect(body.data.general).toHaveProperty('max_score');
    expect(body.data.general).toHaveProperty('median_score');
    expect(body.data.general).toHaveProperty('min_score');
  });
});