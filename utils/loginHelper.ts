import dotenv from 'dotenv';
dotenv.config(); // loads .env

export async function login(page, username, password) {
  // Max cleanliness: clear caches, storage, service workers, IndexedDB
  // Use a try/catch so test doesn't fail if some are not available
  await page.goto('https://staging.lokasi.com/intelligence/login', { waitUntil: 'load' });

  // Clear local/session storage and IndexedDB
  try {
    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      if (window.indexedDB && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name);
        }
      }
    });
  } catch (e) {
    // Ignore if not supported
  }

  // Unregister service workers
  try {
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
    });
  } catch (e) {
    // Ignore if not supported
  }

  // Add null/undefined checks with fallback to env variables
  const userEmail = username || process.env.TEST_USER;
  const userPassword = password || process.env.TEST_PASSWORD;

  // Fill email and continue
  await page.getByRole('textbox', { name: 'Email address' }).fill(userEmail);
  await page.getByRole('button', { name: 'Continue' }).click();
  
  // Fill password and sign in
  await page.getByRole('textbox', { name: 'Password' }).fill(userPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();
}