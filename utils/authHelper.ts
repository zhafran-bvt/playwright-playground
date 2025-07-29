import 'dotenv/config';

export async function getAccessToken(request) {
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

  const response = await request.post(AUTH_URL, {
    headers: { 'Content-Type': 'application/json' },
    data: requestBody,
  });

  if (!response.ok()) {
    throw new Error(`Failed to get access token: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  if (typeof body.access_token !== 'string' || body.access_token.length <= 20) {
    throw new Error(`Invalid access token received: ${JSON.stringify(body)}`);
  }

  return body.access_token;
}