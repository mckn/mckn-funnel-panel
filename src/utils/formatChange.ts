// Shown when a change can not be calculated, for example when the denominator is zero.
export const UNAVAILABLE = '—';

const MINUS = '−';

function formatSigned(value: number, formatted: string): string {
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `${MINUS}${formatted}`;
  }
  return formatted;
}

function round(value: number): number {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  // Avoids "−0" for small negative changes.
  return rounded === 0 ? 0 : rounded;
}

// Difference between two counts, like "+1200" or "−35".
export function formatCountChange(delta: number): string {
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, useGrouping: false }).format(
    Math.abs(delta)
  );
  return formatSigned(delta, formatted);
}

// Relative change as a 0–1 decimal, like "+3.5%".
export function formatPercentChange(change: number | null): string {
  if (change === null) {
    return UNAVAILABLE;
  }
  const rounded = round(change * 100);
  return formatSigned(rounded, `${Math.abs(rounded)}%`);
}

// Change in percentage points between two 0–1 rates, like "+2.1 pp".
export function formatPointChange(change: number | null): string {
  if (change === null) {
    return UNAVAILABLE;
  }
  const rounded = round(change);
  return formatSigned(rounded, `${Math.abs(rounded)} pp`);
}

// Percentage point difference between two 0–1 rates. Null when one of them is unavailable.
export function getPointChange(rate: number | null, comparedRate: number | null): number | null {
  if (rate === null || comparedRate === null) {
    return null;
  }
  return (rate - comparedRate) * 100;
}
