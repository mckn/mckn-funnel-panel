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

  test('does not show a tooltip when hovering the funnel', async ({ page }) => {
    await page.getByTestId('bar-1').hover();

    await expect(page.getByTestId('bar-3')).toHaveAttribute('opacity', '0.35');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('does not show a tooltip when hovering the conversion', async ({ page }) => {
    await page.getByTestId('conversion-1').hover();

    await expect(page.getByTestId('bar-1')).toHaveAttribute('opacity', '1');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('does not focus the funnel when clicking it', async ({ page }) => {
    await page.getByTestId('bar-2').click();

    await expect(page.getByTestId('bar-2')).not.toBeFocused();
  });
});

test.describe('panel with flow layout and data links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=11&orgId=1');
  });

  test('shows the links menu when hovering a step', async ({ page }) => {
    // The wrapper around the button controls the visibility.
    const menu = page.getByTestId('menu-0').locator('..');

    await expect(menu).toHaveCSS('opacity', '0');
    await page.getByTestId('step-0').hover();
    await expect(menu).toHaveCSS('opacity', '1');
  });

  test('lists the data links of the step when opening the menu', async ({ page }) => {
    await page.getByTestId('step-0').hover();
    await page.getByTestId('menu-0').click();

    await expect(page.getByLabel('Show Sent details')).toHaveAttribute('href', /var-step=Sent&var-value=52300/);
    await expect(page.getByLabel('Search for Sent')).toHaveAttribute('href', 'https://grafana.com/search/?query=Sent');
    await expect(page.getByLabel('Search for Sent')).toHaveAttribute('target', '_blank');
  });
});

test.describe('panel with flow layout and no data links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=13&orgId=1');
  });

  test('does not show the links menu', async ({ page }) => {
    await page.getByTestId('step-0').hover();

    await expect(page.getByTestId('menu-0')).toHaveCount(0);
  });
});

test.describe('panel with compact flow layout', () => {
  test.beforeEach(async ({ page }) => {
    // A short viewport makes the steps of panel 12 compact.
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/d/NtsITqb4z/funnel-examples?viewPanel=12&orgId=1');
  });

  test('puts the step details on the same text baseline', async ({ page }) => {
    await expect(page.getByTestId('conversion-1')).toBeVisible();

    // A zero-size inline-block after each text sits on the baseline of that text.
    const baselines = await page.getByTestId('step-1').evaluate((step) => {
      const walker = document.createTreeWalker(step, NodeFilter.SHOW_TEXT);
      const result: number[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) {
          continue;
        }
        const marker = document.createElement('span');
        marker.style.cssText = 'display: inline-block; width: 0; height: 0;';
        node.parentNode!.insertBefore(marker, node.nextSibling);
        result.push(marker.getBoundingClientRect().bottom);
        marker.remove();
      }
      return result;
    });

    // Title, value, conversion and caption.
    expect(baselines).toHaveLength(4);
    expect(Math.max(...baselines) - Math.min(...baselines)).toBeLessThan(1);
  });
});
