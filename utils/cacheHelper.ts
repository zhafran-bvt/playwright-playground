import { Page, BrowserContext } from '@playwright/test';

export async function maxCleanPage(context: BrowserContext, page: Page, url: string) {
  // Clear cookies and permissions
  await context.clearCookies();
  await context.clearPermissions();

  // Visit the login or landing page (must be same-origin for storage clearing)
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Clear localStorage, sessionStorage, IndexedDB
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

  // Unregister service workers
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) await reg.unregister();
    }
  });
}