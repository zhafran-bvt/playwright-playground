import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { attachToAllure } from '../../utils/allureHelper';

const AUTH_URL = `${process.env.API_BASE_URL}/v1/auth/token`;
const EMAIL = process.env.TEST_USER;
const PASSWORD = process.env.TEST_PASSWORD;
const CLIENT_ID = process.env.API_CLIENT_ID;

test('API - should get access token from auth endpoint', async ({ request }, testInfo) => {
    const requestBody = {
      grant_type: 'password',
      email_address: EMAIL,
      password: PASSWORD,
      client_id: CLIENT_ID,
    };
  
    await attachToAllure(testInfo, 'request-body', requestBody);
  
    const response = await request.post(AUTH_URL, {
      headers: { 'Content-Type': 'application/json' },
      data: requestBody,
    });
  
    await attachToAllure(testInfo, 'response-status', response.status().toString());
    await attachToAllure(testInfo, 'response-body', await response.json());
  
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(20);
  });