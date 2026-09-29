import { createTheme } from '@grafana/data';
import { OutcomeDirection } from 'types';
import { getOutcome, getOutcomeColor } from './getOutcomeColor';

describe('getOutcome', () => {
  it.each([
    [5, OutcomeDirection.higher, 'favorable'],
    [-5, OutcomeDirection.higher, 'unfavorable'],
    [5, OutcomeDirection.lower, 'unfavorable'],
    [-5, OutcomeDirection.lower, 'favorable'],
    [0, OutcomeDirection.higher, 'neutral'],
    [null, OutcomeDirection.lower, 'neutral'],
  ])('treats %p as %s when %s is favorable', (change, direction, expected) => {
    expect(getOutcome(change, direction)).toBe(expected);
  });
});

describe('getOutcomeColor', () => {
  const theme = createTheme();

  it('uses the success, error and secondary text colors', () => {
    expect(getOutcomeColor('favorable', theme)).toBe(theme.colors.success.text);
    expect(getOutcomeColor('unfavorable', theme)).toBe(theme.colors.error.text);
    expect(getOutcomeColor('neutral', theme)).toBe(theme.colors.text.secondary);
  });
});
