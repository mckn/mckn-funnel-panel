import { test, expect } from '@playwright/test';

test('panel render "no data" successfully', async ({ page }) => {
  await page.goto('/d/NtsITqb4z/funnel-examples?orgId=1&viewPanel=6');
  await expect(page.getByRole('heading', { name: 'No data' })).toBeVisible();
});
