import { expect, test } from '@grafana/plugin-e2e';
import semver from 'semver';

const TIME_COMPARISON_VERSION = '12.3.0';

test.describe('panel with flow layout and Grafana Time comparison', () => {
  test.beforeEach(async ({ grafanaVersion }) => {
    test.skip(
      semver.lt(grafanaVersion, TIME_COMPARISON_VERSION),
      'Grafana Time comparison requires Grafana 12.3 or later'
    );
  });

  test('labels the compared periods', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=14&orgId=1');

    const header = page.getByTestId('comparison-header');
    await expect(header).toContainText('Last 30 minutes compared with Last 30 minutes (1 day ago)');
    await expect(header).toContainText('Overall conversion6.29%');
    await expect(page.getByTestId('overall-change')).toHaveText('0 pp');
  });

  test('shows the newest funnel with the changes from the oldest period', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=14&orgId=1');

    await expect(page.getByTestId('label-1')).toContainText('Viewed');
    await expect(page.getByTestId('value-1')).toContainText('35679');
    await expect(page.getByTestId('percentage-1')).toContainText('68.22%');
    await expect(page.getByTestId('count-change-1')).toContainText('0 (0%)');
    await expect(page.getByTestId('count-change-1')).toContainText('vs 35679');
    await expect(page.getByTestId('conversion-change-1')).toContainText('0 pp');
    await expect(page.getByTestId('conversion-change-1')).toContainText('vs 31.78%');
  });

  test('does not show a conversion change for the first step', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=14&orgId=1');

    await expect(page.getByTestId('count-change-0')).toContainText('0 (0%)');
    await expect(page.getByTestId('conversion-change-0')).toHaveCount(0);
  });

  test('detects the comparison after the Rows to fields transformation', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=15&orgId=1');

    // The transformation removes the metadata with the time offset.
    await expect(page.getByTestId('comparison-header')).toContainText(
      'Last 30 minutes compared with Comparison period (time offset unavailable)'
    );
    await expect(page.getByTestId('label-4')).toContainText('Purchased');
    await expect(page.getByTestId('count-change-4')).toContainText('0 (0%)');
    await expect(page.getByTestId('conversion-change-4')).toContainText('0 pp');
  });
});

test.describe('panel with flow layout without Grafana Time comparison', () => {
  test.beforeEach(async ({ grafanaVersion }) => {
    test.skip(semver.gte(grafanaVersion, TIME_COMPARISON_VERSION), 'Grafana supports Time comparison');
  });

  test('shows the funnel without changes', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=14&orgId=1');

    await expect(page.getByTestId('value-1')).toContainText('35679');
    await expect(page.getByTestId('comparison-header')).toHaveCount(0);
    await expect(page.getByTestId('count-change-1')).toHaveCount(0);
  });
});
