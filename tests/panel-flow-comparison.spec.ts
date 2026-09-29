import { expect, test } from '@grafana/plugin-e2e';
import semver from 'semver';

const TIME_COMPARISON_VERSION = '12.3.0';

// The TestData waves depend on the time, so a fixed range gives the same values on every run.
// 2025-09-25 10:00:00 to 10:30:00 UTC, compared with the same range one day before.
const FIXED_RANGE = 'from=1758794400000&to=1758796200000&timezone=utc';

function panelUrl(panelId: number, range = FIXED_RANGE): string {
  return `/d/NtsITqb4z/funnel-examples?viewPanel=${panelId}&orgId=1&${range}`;
}

test.describe('panel with flow layout and Grafana Time comparison', () => {
  test.beforeEach(async ({ grafanaVersion }) => {
    test.skip(
      semver.lt(grafanaVersion, TIME_COMPARISON_VERSION),
      'Grafana Time comparison requires Grafana 12.3 or later'
    );
  });

  test('shows the newest funnel with the changes from the oldest period', async ({ page }) => {
    await page.goto(panelUrl(14));

    // Grafana shows the compared period in the panel title, so the header has the overall conversion only.
    await expect(page.getByTestId('comparison-header')).toHaveText('Overall conversion8.4%+0.8 pp');
    await expect(page.getByTestId('overall-change')).toHaveText('+0.8 pp');
    await expect(page.getByTestId('label-1')).toContainText('Viewed');
    await expect(page.getByTestId('value-1')).toContainText('3010');
    await expect(page.getByTestId('percentage-1')).toContainText('70.82%');
    await expect(page.getByTestId('count-change-1')).toContainText('+310 (+11.48%)');
    await expect(page.getByTestId('count-change-1')).toContainText('vs 2700');
    await expect(page.getByTestId('conversion-1')).toContainText('29.18%');
    await expect(page.getByTestId('conversion-change-1')).toContainText('−4.16 pp');
    await expect(page.getByTestId('conversion-change-1')).toContainText('vs 33.33%');
  });

  test('does not show a conversion change for the first step', async ({ page }) => {
    await page.goto(panelUrl(14));

    await expect(page.getByTestId('count-change-0')).toContainText('+200 (+4.94%)');
    await expect(page.getByTestId('conversion-change-0')).toHaveCount(0);
  });

  test('shows the oldest funnel with the changes from the newest period', async ({ page }) => {
    await page.goto(panelUrl(16));

    await expect(page.getByTestId('comparison-header')).toHaveText('Overall conversion7.6%−0.8 pp');
    await expect(page.getByTestId('value-1')).toContainText('2700');
    await expect(page.getByTestId('count-change-1')).toContainText('−310 (−10.3%)');
    await expect(page.getByTestId('count-change-1')).toContainText('vs 3010');
    await expect(page.getByTestId('conversion-1')).toContainText('66.67%');
    await expect(page.getByTestId('conversion-change-1')).toContainText('−4.16 pp');
    await expect(page.getByTestId('conversion-change-1')).toContainText('vs 70.82%');
  });

  test('detects the comparison after the Rows to fields transformation', async ({ page }) => {
    await page.goto(panelUrl(15, ''));

    // The transformation removes the metadata. The panel detects the comparison by the query reference.
    await expect(page.getByTestId('comparison-header')).toHaveText('Overall conversion6.29%0 pp');
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
    await page.goto(panelUrl(14));

    await expect(page.getByTestId('value-1')).toContainText('3010');
    await expect(page.getByTestId('comparison-header')).toHaveCount(0);
    await expect(page.getByTestId('count-change-1')).toHaveCount(0);
  });
});
