import { expect, test } from '@grafana/plugin-e2e';
import semver from 'semver';

// Grafana 11.0 does not replace dashboard variables in the filter transformations of the drill-down.
const DRILLDOWN_FILTER_VERSION = '11.3.0';

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

  test('shows only the users of the selected step in the drill-down table', async ({ page, grafanaVersion }) => {
    test.skip(
      semver.lt(grafanaVersion, DRILLDOWN_FILTER_VERSION),
      'The drill-down filters need variables in transformations, which Grafana 11.3 or later supports'
    );
    await page.goto('/d/funnel-demo-drilldown?orgId=1&var-step=Payment%20info&var-platform=$__all');

    // Older Grafana versions render table cells without a gridcell role, so match on text.
    await expect(page.getByRole('link', { name: /^u_\d+$/ }).first()).toBeVisible();
    await expect(page.getByText('Payment info', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Product viewed', { exact: true })).toHaveCount(0);
  });
});
