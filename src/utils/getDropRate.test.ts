import { getDropRate, getTrendIconName } from './getDropRate';

describe('getDropRate', () => {
  it('returns the relative drop between two steps', () => {
    expect(getDropRate(1, 0.25)).toBe(0.75);
  });

  it('returns a negative drop when the next step is larger', () => {
    expect(getDropRate(0.5, 1)).toBe(-1);
  });

  it('returns zero when both steps are equal', () => {
    expect(getDropRate(0.3, 0.3)).toBe(0);
  });
});

describe('getTrendIconName', () => {
  it.each([
    [1, 0.5, 'arrow-down'],
    [0.5, 1, 'arrow-up'],
    [0.5, 0.5, 'arrow-right'],
  ])('from %p to %p returns %p', (from, to, expected) => {
    expect(getTrendIconName(from, to)).toBe(expected);
  });
});
