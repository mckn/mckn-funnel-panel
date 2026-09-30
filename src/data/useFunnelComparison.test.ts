import { renderHook } from '@testing-library/react';
import { createTheme, FieldType, toDataFrame, type DataFrame } from '@grafana/data';
import { ComparisonPeriod, Layout, Sorting } from 'types';
import { useFunnelComparison } from './useFunnelComparison';

const DAY = 24 * 60 * 60 * 1000;

const options = { layout: Layout.flow, sorting: Sorting.descending, comparisonPeriod: ComparisonPeriod.newest };

const params = {
  fieldConfig: { defaults: {}, overrides: [] },
  replaceVariables: (value: string) => value,
  theme: createTheme(),
  timeZone: 'utc',
};

function wide(refId: string, counts: Record<string, number>): DataFrame {
  return toDataFrame({
    refId,
    meta: refId.endsWith('-compare') ? { timeCompare: { isTimeShiftQuery: true, diffMs: -DAY } } : undefined,
    fields: Object.entries(counts).map(([name, value]) => ({ name, type: FieldType.number, values: [value] })),
  });
}

function renderComparison(data: DataFrame[], panelOptions = options) {
  return renderHook(() => useFunnelComparison({ ...params, data }, panelOptions));
}

describe('useFunnelComparison', () => {
  it('returns the frames without a comparison when there is no comparison period', () => {
    const data = [wide('A', { Sent: 100, Viewed: 70 })];
    const { result } = renderComparison(data);

    expect(result.current).toEqual({ current: data });
  });

  it('compares the current period with the Grafana Time comparison period', () => {
    const current = wide('A', { Sent: 100, Viewed: 70 });
    const { result } = renderComparison([current, wide('A-compare', { Sent: 80, Viewed: 60 })]);

    expect(result.current.current).toEqual([current]);
    expect(result.current.error).toBeUndefined();
    expect(result.current.comparison?.values.map((value) => value.numeric)).toEqual([100, 70]);
    expect(result.current.comparison?.steps.map((step) => step.countDelta)).toEqual([20, 10]);
  });

  it('shows the current period only in the classic layout', () => {
    const current = wide('A', { Sent: 100 });
    const { result } = renderComparison([current, wide('A-compare', { Sent: 80 })], {
      ...options,
      layout: Layout.classic,
    });

    expect(result.current).toEqual({ current: [current] });
  });

  it('reports the error when the steps of the periods do not match', () => {
    const current = wide('A', { Sent: 100, Viewed: 70 });
    const { result } = renderComparison([current, wide('A-compare', { Sent: 80, Clicked: 60 })]);

    expect(result.current).toEqual({ current: [current], error: 'unmatched-steps' });
  });

  it('reports the error when the current period is missing', () => {
    const { result } = renderComparison([wide('A-compare', { Sent: 80 })]);

    expect(result.current).toEqual({ current: [], error: 'missing-period' });
  });

  it('keeps the same result when the inputs do not change', () => {
    const data = [wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 })];
    const { result, rerender } = renderComparison(data);
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
