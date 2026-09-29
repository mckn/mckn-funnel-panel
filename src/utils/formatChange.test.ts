import { formatCountChange, formatPercentChange, formatPointChange, getPointChange } from './formatChange';

describe('formatCountChange', () => {
  it.each([
    [1200, '+1200'],
    [-35, '−35'],
    [0, '0'],
    [0.125, '+0.13'],
  ])('formats %d as "%s"', (delta, expected) => {
    expect(formatCountChange(delta)).toBe(expected);
  });
});

describe('formatPercentChange', () => {
  it.each([
    [0.035, '+3.5%'],
    [-0.5625, '−56.25%'],
    [0, '0%'],
    [-0.00001, '0%'],
    [null, '—'],
  ])('formats %p as "%s"', (change, expected) => {
    expect(formatPercentChange(change)).toBe(expected);
  });
});

describe('formatPointChange', () => {
  it.each([
    [2.1, '+2.1 pp'],
    [-10, '−10 pp'],
    [0, '0 pp'],
    [null, '—'],
  ])('formats %p as "%s"', (change, expected) => {
    expect(formatPointChange(change)).toBe(expected);
  });
});

describe('getPointChange', () => {
  it('returns the difference in percentage points', () => {
    expect(getPointChange(0.7, 0.8)).toBeCloseTo(-10);
  });

  it('is unavailable when one of the rates is unavailable', () => {
    expect(getPointChange(null, 0.8)).toBeNull();
    expect(getPointChange(0.7, null)).toBeNull();
  });
});
