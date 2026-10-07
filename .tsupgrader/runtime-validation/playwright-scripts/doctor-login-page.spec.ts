import { test, expect } from '@playwright/test';

test.use({ channel: 'msedge' });

test('doctor-login-page', async ({ page }) => {
  await page.route("**/*", async route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === "http://localhost:3000") {
      await route.continue();
    } else {
      await route.abort("blockedbyclient");
    }
  });
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: '👨‍⚕️ I AM A DOCTOR' }).click();
  await expect(page.getByRole('heading', { name: 'Doctor Login' })).toBeVisible();
});
