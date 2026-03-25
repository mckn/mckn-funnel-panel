import { test, expect } from '@playwright/test';

test.describe('panel with showPercentage enabled (default)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=7&orgId=1');
  });

  test('percentage elements are visible', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId(`percentage-${i}`)).toBeVisible();
    }
  });
});

test.describe('panel with showPercentage disabled', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=10&orgId=1');
  });

  test('percentage elements are not rendered', async ({ page }) => {
    await expect(page.getByTestId('bar-0')).toBeVisible();
    await expect(page.getByTestId('percentage-0')).not.toBeVisible();
  });

  test('bars and labels still render correctly', async ({ page }) => {
    await expect(page.getByTestId('bar-0')).toContainText('52300');
    await expect(page.getByTestId('label-0')).toContainText('Sent');
  });
});
