import { test, expect } from '@playwright/test';

test('panel render "Unsupported data" successfully', async ({ page }) => {
  await page.goto('/d/NtsITqb4z/funnel-examples?orgId=1&viewPanel=5');
  await expect(page.getByRole('heading', { name: 'Unsupported data' })).toBeVisible();
});
