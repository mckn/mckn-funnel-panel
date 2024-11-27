import { test, expect } from '@playwright/test';

[
  { label: 'Sent', value: '52300', percentage: '100%', drop: '31.78%' },
  { label: 'Viewed', value: '35679', percentage: '68.22%', drop: '56.02%' },
  { label: 'Clicked', value: '15690', percentage: '30%', drop: '64.33%' },
  { label: 'Add to cart', value: '5596', percentage: '10.7%', drop: '41.21%' },
  { label: 'Purchased', value: '3290', percentage: '6.29%' },
].forEach(({ value, label, percentage, drop }, index) => {
  test.describe('panel render data successfully', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=7&orgId=1');
    });

    test(`${label} render successfully`, async ({ page }) => {
      await expect(page.getByTestId(`bar-${index}`)).toContainText(value);
      await expect(page.getByTestId(`label-${index}`)).toContainText(label);
      await expect(page.getByTestId(`percentage-${index}`)).toContainText(percentage);

      if (drop) {
        await expect(page.getByTestId(`gap-${index}`)).toContainText(drop);
      }
    });
  });
});

[
  { label: 'Purchased', value: '3290', percentage: '6.29%', drop: '70.09%' },
  { label: 'Add to cart', value: '5596', percentage: '10.7%', drop: '180.38%' },
  { label: 'Clicked', value: '15690', percentage: '30%', drop: '127.4%' },
  { label: 'Viewed', value: '35679', percentage: '68.22%', drop: '46.58%' },
  { label: 'Sent', value: '52300', percentage: '100%' },
].forEach(({ value, label, percentage, drop }, index) => {
  test.describe('panel render data sorted ascending successfully', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=8&orgId=1');
    });

    test(`${label} render successfully`, async ({ page }) => {
      await expect(page.getByTestId(`bar-${index}`)).toContainText(value);
      await expect(page.getByTestId(`label-${index}`)).toContainText(label);
      await expect(page.getByTestId(`percentage-${index}`)).toContainText(percentage);

      if (drop) {
        await expect(page.getByTestId(`gap-${index}`)).toContainText(drop);
      }
    });
  });
});

[
  { label: 'Viewed', value: '11', percentage: '100%', drop: '90.91%' },
  { label: 'Clicked', value: '1', percentage: '9.09%', drop: '0%' },
  { label: 'Add to cart', value: '1', percentage: '9.09%', drop: '100%' },
  { label: 'Purchased', value: '0', percentage: '0%' },
].forEach(({ value, label, percentage, drop }, index) => {
  test.describe('panel render gaps successfully', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/d/NtsITqb4z/funnel-examples?orgId=1&viewPanel=2');
    });

    test(`${label} render successfully`, async ({ page }) => {
      await expect(page.getByTestId(`bar-${index}`)).toContainText(value);
      await expect(page.getByTestId(`label-${index}`)).toContainText(label);
      await expect(page.getByTestId(`percentage-${index}`)).toContainText(percentage);

      if (drop) {
        await expect(page.getByTestId(`gap-${index}`)).toContainText(drop);
      }
    });
  });
});
