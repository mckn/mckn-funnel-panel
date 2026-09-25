import { test, expect } from '@playwright/test';

const steps = [
  { label: 'Sent', value: '52300', percentage: '100%' },
  { label: 'Viewed', value: '35679', percentage: '68.22%', conversion: '31.78%' },
  { label: 'Clicked', value: '15690', percentage: '30%', conversion: '56.02%' },
  { label: 'Add to cart', value: '5596', percentage: '10.7%', conversion: '64.33%' },
  { label: 'Purchased', value: '3290', percentage: '6.29%', conversion: '41.21%' },
];

[
  { orientation: 'vertical', panelId: 11 },
  { orientation: 'horizontal', panelId: 13 },
].forEach(({ orientation, panelId }) => {
  steps.forEach(({ value, label, percentage, conversion }, index) => {
    test.describe(`panel with ${orientation} flow layout`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/d/NtsITqb4z/funnel-examples?viewPanel=${panelId}&orgId=1`);
      });

      test(`${label} render successfully`, async ({ page }) => {
        await expect(page.getByTestId(`step-${index}`)).toBeVisible();
        await expect(page.getByTestId(`bar-${index}`)).toBeVisible();
        await expect(page.getByTestId(`label-${index}`)).toContainText(label);
        await expect(page.getByTestId(`value-${index}`)).toContainText(value);
        await expect(page.getByTestId(`percentage-${index}`)).toContainText(percentage);

        if (conversion) {
          await expect(page.getByTestId(`conversion-${index}`)).toContainText(conversion);
        } else {
          await expect(page.getByTestId(`conversion-${index}`)).not.toBeVisible();
        }
      });
    });
  });
});

[
  { label: 'Viewed', conversion: '68.22%' },
  { label: 'Clicked', conversion: '43.98%' },
  { label: 'Add to cart', conversion: '35.67%' },
  { label: 'Purchased', conversion: '58.79%' },
].forEach(({ label, conversion }, index) => {
  test.describe('panel with flow layout and retention rate', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=12&orgId=1');
    });

    test(`${label} render retention successfully`, async ({ page }) => {
      await expect(page.getByTestId(`label-${index + 1}`)).toContainText(label);
      await expect(page.getByTestId(`conversion-${index + 1}`)).toContainText(conversion);
    });
  });
});

test.describe('panel with flow layout highlighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=13&orgId=1');
  });

  test('dims the other steps when hovering a step', async ({ page }) => {
    await page.getByTestId('step-2').hover();

    await expect(page.getByTestId('bar-2')).toHaveAttribute('opacity', '1');
    await expect(page.getByTestId('bar-0')).toHaveAttribute('opacity', '0.35');
  });

  test('dims the other steps when hovering the funnel', async ({ page }) => {
    await page.getByTestId('bar-1').hover();

    await expect(page.getByTestId('bar-1')).toHaveAttribute('opacity', '1');
    await expect(page.getByTestId('bar-3')).toHaveAttribute('opacity', '0.35');
  });
});
