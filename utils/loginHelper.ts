import dotenv from 'dotenv';
dotenv.config(); // loads .env

export async function login(page, username, password) {
  // Add null/undefined checks with fallback to env variables
  const userEmail = username || process.env.TEST_USER;
  const userPassword = password || process.env.TEST_PASSWORD;
  
  await page.goto('https://staging.lokasi.com/intelligence/login');

  // Fill email and continue
  await page.getByRole('textbox', { name: 'Email address' }).fill(userEmail);
  await page.getByRole('button', { name: 'Continue' }).click();
  
  // Fill password and sign in
  await page.getByRole('textbox', { name: 'Password' }).fill(userPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();
}