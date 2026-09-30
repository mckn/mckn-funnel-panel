import { expect, test } from '@grafana/plugin-e2e';

test.describe('demo dashboard', () => {
  test('opens the drill-down dashboard from the links menu of a step', async ({ page }) => {
    await page.goto('/d/funnel-demo?orgId=1');

    await page.getByTestId('step-2').hover();
    await page.getByTestId('menu-2').click();
    await expect(page.getByLabel('Drill into Checkout started')).toHaveAttribute('href', /var-step=Checkout%20started/);
    await page.getByLabel('Drill into Checkout started').click();

    await expect(page).toHaveURL(/\/d\/funnel-demo-drilldown\//);
    await expect(page).toHaveURL(/var-step=Checkout(%20|\+)started/);
    await expect(page.getByText('Users whose last step was Checkout started').first()).toBeVisible();
  });

  test('keeps the platform when drilling down', async ({ page }) => {
    await page.goto('/d/funnel-demo?orgId=1&var-platform=iOS');

    await page.getByTestId('step-1').first().hover();
    await page.getByTestId('menu-1').first().click();
    await page.getByLabel('Drill into Added to cart').first().click();

    await expect(page).toHaveURL(/var-platform=iOS/);
  });

  test('shows only the users of the selected step in the drill-down table', async ({ page }) => {
    await page.goto('/d/funnel-demo-drilldown?orgId=1&var-step=Payment%20info&var-platform=$__all');

    const cells = page.getByRole('gridcell', { name: 'Payment info' });
    await expect(cells.first()).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Product viewed' })).toHaveCount(0);
  });
});
