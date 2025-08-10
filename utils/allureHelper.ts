import { TestInfo } from '@playwright/test';

/**
 * Attach data (string, object, Buffer) to Allure report for the current test.
 */
export async function attachToAllure(
  testInfo: TestInfo,
  name: string,
  data: string | object | Buffer,
  contentType?: string
) {
  let body: string | Buffer;
  let type: string;

  if (Buffer.isBuffer(data)) {
    body = data;
    type = contentType || 'application/octet-stream';
  } else if (typeof data === 'object') {
    body = JSON.stringify(data, null, 2);
    type = contentType || 'application/json';
  } else {
    body = data;
    type = contentType || 'text/plain';
  }
  await testInfo.attach(name, { body, contentType: type });
}

/**
 * Utility to build a redacted Authorization header for attachments.
 */
export function redactedAuthHeader() {
  return { Authorization: 'Bearer <redacted>' } as const;
}

/**
 * Convenience helpers to attach a standardized API request/response pair
 * that mirrors the format used in analysisConfig steps.
 */
export async function attachApiRequest(
  testInfo: TestInfo,
  name: string,
  req: { url: string; method: string; headers?: Record<string, any>; body?: any }
) {
  const { url, method, headers, body } = req;
  const attachPayload: any = { url, method, headers: headers || {} };
  if (typeof body !== 'undefined') attachPayload.body = body;
  await attachToAllure(testInfo, name, attachPayload);
}

export async function attachApiResponse(
  testInfo: TestInfo,
  name: string,
  res: { status: number; body: any }
) {
  await attachToAllure(testInfo, name, { status: res.status, body: res.body });
}
