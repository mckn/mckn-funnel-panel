import { expect, test } from '@grafana/plugin-e2e';
import semver from 'semver';

test.describe('panel with flow layout and manual comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=14&orgId=1');
  });

  test('shows the compared periods and the overall conversion change', async ({ page }) => {
    const header = page.getByTestId('comparison-header');

    await expect(header).toContainText('Current query (A) compared with Comparison query (B)');
    await expect(header).toContainText('Overall conversion20%');
    await expect(page.getByTestId('overall-change')).toHaveText('−10 pp');
  });

  test('shows the newest funnel with the changes from the oldest period', async ({ page }) => {
    await expect(page.getByTestId('label-1')).toContainText('Viewed');
    await expect(page.getByTestId('value-1')).toContainText('700');
    await expect(page.getByTestId('percentage-1')).toContainText('70%');
    await expect(page.getByTestId('count-change-1')).toContainText('−900 (−56.25%)');
    await expect(page.getByTestId('count-change-1')).toContainText('vs 1600');
    await expect(page.getByTestId('conversion-1')).toContainText('30%');
    await expect(page.getByTestId('conversion-change-1')).toContainText('+10 pp');
    await expect(page.getByTestId('conversion-change-1')).toContainText('vs 20%');
  });

  test('does not show a conversion change for the first step', async ({ page }) => {
    await expect(page.getByTestId('count-change-0')).toContainText('−1000 (−50%)');
    await expect(page.getByTestId('conversion-change-0')).toHaveCount(0);
  });
});

test.describe('panel with flow layout and Grafana Time comparison', () => {
  test.beforeEach(async ({ grafanaVersion }) => {
    test.skip(semver.lt(grafanaVersion, '12.3.0'), 'Grafana Time comparison requires Grafana 12.3 or later');
  });

  test('detects the comparison and labels the periods', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=15&orgId=1');

    await expect(page.getByTestId('comparison-header')).toContainText(
      'Last 30 minutes compared with Last 30 minutes (1 day ago)'
    );
    await expect(page.getByTestId('value-4')).toContainText('3290');
    await expect(page.getByTestId('count-change-4')).toContainText('0 (0%)');
    await expect(page.getByTestId('conversion-change-4')).toContainText('0 pp');
  });

  test('detects the comparison after the Rows to fields transformation', async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=16&orgId=1');

    // The transformation removes the metadata with the time offset.
    await expect(page.getByTestId('comparison-header')).toContainText(
      'Last 30 minutes compared with Comparison period (time offset unavailable)'
    );
    await expect(page.getByTestId('label-4')).toContainText('Purchased');
    await expect(page.getByTestId('count-change-4')).toContainText('0 (0%)');
    await expect(page.getByTestId('conversion-change-4')).toContainText('0 pp');
  });
});
