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