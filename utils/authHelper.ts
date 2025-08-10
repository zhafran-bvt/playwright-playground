import 'dotenv/config';
import type { TestInfo } from '@playwright/test';
import { attachApiRequest, attachApiResponse } from './allureHelper';

export async function getAccessToken(request, testInfo?: TestInfo) {
  const AUTH_URL = `${process.env.API_BASE_URL}/v1/auth/token`;
  const EMAIL = process.env.TEST_USER;
  const PASSWORD = process.env.TEST_PASSWORD;
  const CLIENT_ID = process.env.API_CLIENT_ID;

  const requestBody = {
    grant_type: 'password',
    email_address: EMAIL,
    password: PASSWORD,
    client_id: CLIENT_ID,
  };

  if (testInfo) {
    await attachApiRequest(testInfo, 'auth-token-request', {
      url: AUTH_URL,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Do not attach credentials/body for security
    });
  }

  const response = await request.post(AUTH_URL, {
    headers: { 'Content-Type': 'application/json' },
    data: requestBody,
  });

  if (!response.ok()) {
    throw new Error(`Failed to get access token: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  if (testInfo) {
    const redactedBody = { ...body } as any;
    if (redactedBody.access_token) redactedBody.access_token = '<redacted>';
    await attachApiResponse(testInfo, 'auth-token-response', {
      status: response.status(),
      body: redactedBody,
    });
  }
  if (typeof body.access_token !== 'string' || body.access_token.length <= 20) {
    throw new Error(`Invalid access token received: ${JSON.stringify(body)}`);
  }

  return body.access_token;
}
