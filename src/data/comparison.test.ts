import { createTheme, FieldType, toDataFrame, type DataFrame } from '@grafana/data';
import { ComparisonPeriod, Layout, Sorting } from 'types';
import { buildComparison, type CompareSelection, hasGrafanaComparison, selectComparisonFrames } from './comparison';

const DAY = 24 * 60 * 60 * 1000;

const flow = { layout: Layout.flow };

const displayOptions = {
  fieldConfig: { defaults: {}, overrides: [] },
  replaceVariables: (value: string) => value,
  theme: createTheme(),
  timeZone: 'utc',
};

const timeCompare = { isTimeShiftQuery: true, diffMs: -DAY };

const link = { title: 'Details', url: '/details' };

// One frame with a numeric field per step. Frames with a "-compare" reference are the comparison period.
function wide(refId: string, counts: Record<string, number>): DataFrame {
  return toDataFrame({
    refId,
    name: 'Funnel',
    meta: refId.endsWith('-compare') ? { timeCompare } : undefined,
    fields: Object.entries(counts).map(([name, value]) => ({ name, type: FieldType.number, values: [value] })),
  });
}

// One frame per step.
function step(refId: string, name: string, count: number): DataFrame {
  return toDataFrame({
    refId,
    name,
    meta: refId.endsWith('-compare') ? { timeCompare } : undefined,
    fields: [{ name: 'Value', type: FieldType.number, values: [count] }],
  });
}

function compare(current: Record<string, number>, previous: Record<string, number>): CompareSelection {
  return select([wide('A', current), wide('A-compare', previous)]);
}

function select(frames: DataFrame[]): CompareSelection {
  const selection = selectComparisonFrames(frames, flow);
  if (selection.kind !== 'compare') {
    throw new Error(`Expected a comparison selection, got ${selection.kind}`);
  }
  return selection;
}

function build(selection: CompareSelection, sorting = Sorting.none, comparisonPeriod = ComparisonPeriod.newest) {
  const result = buildComparison(selection, displayOptions, { sorting, comparisonPeriod });
  if (result.kind !== 'ready') {
    throw new Error(`Expected a comparison, got ${result.reason}`);
  }
  return result;
}

function buildError(selection: CompareSelection) {
  return buildComparison(selection, displayOptions, {
    sorting: Sorting.none,
    comparisonPeriod: ComparisonPeriod.newest,
  });
}

describe('selectComparisonFrames', () => {
  it('detects the Grafana Time comparison metadata', () => {
    const selection = compare({ Sent: 100 }, { Sent: 80 });

    expect(selection.current.map((frame) => frame.refId)).toEqual(['A']);
    expect(selection.previous.map((frame) => frame.refId)).toEqual(['A-compare']);
  });

  it('detects the Grafana Time comparison field config', () => {
    const previous = toDataFrame({
      refId: 'X',
      fields: [{ name: 'Sent', type: FieldType.number, values: [80], config: { custom: { timeCompare } } }],
    });

    expect(select([wide('A', { Sent: 100 }), previous]).previous).toEqual([previous]);
  });

  it('detects paired comparison references after a transformation removes the metadata', () => {
    const previous = toDataFrame({
      refId: 'A-compare',
      fields: [{ name: 'Sent', type: FieldType.number, values: [80] }],
    });

    expect(select([wide('A', { Sent: 100 }), previous]).previous).toEqual([previous]);
  });

  it('does not treat a standalone comparison reference as a comparison', () => {
    const frame = toDataFrame({
      refId: 'A-compare',
      fields: [{ name: 'Sent', type: FieldType.number, values: [100] }],
    });

    expect(selectComparisonFrames([frame], flow).kind).toBe('single');
  });

  it('shows a single funnel without a comparison period', () => {
    const frames = [wide('A', { Sent: 100 }), wide('B', { Sent: 80 })];

    expect(selectComparisonFrames(frames, flow)).toEqual({ kind: 'single', current: frames });
  });

  it('reports a missing current period', () => {
    const selection = selectComparisonFrames([wide('A-compare', { Sent: 80 })], flow);

    expect(selection).toEqual({ kind: 'error', current: [], reason: 'missing-period' });
  });

  it('shows the current period only in the classic layout', () => {
    const selection = selectComparisonFrames([wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 })], {
      layout: Layout.classic,
    });

    expect(selection.kind).toBe('single');
    expect(selection.current.map((frame) => frame.refId)).toEqual(['A']);
  });
});

describe('hasGrafanaComparison', () => {
  it('is true when the data has a comparison period', () => {
    expect(hasGrafanaComparison([wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 })])).toBe(true);
  });

  it('is false without a comparison period or without data', () => {
    expect(hasGrafanaComparison([wide('A', { Sent: 100 })])).toBe(false);
    expect(hasGrafanaComparison(undefined)).toBe(false);
  });
});

describe('buildComparison', () => {
  it('compares conversion rates independently of the traffic volume', () => {
    const result = build(compare({ Sent: 100, Viewed: 70, Purchased: 20 }, { Sent: 200, Viewed: 160, Purchased: 60 }));

    expect(result.values.map((value) => value.title)).toEqual(['Sent', 'Viewed', 'Purchased']);
    expect(result.steps[1]).toMatchObject({ count: 70, comparedCount: 160, countDelta: -90 });
    expect(result.steps[1].countDeltaPercent).toBeCloseTo(-0.5625);
    expect(result.steps[1].stepRate).toBeCloseTo(0.7);
    expect(result.steps[1].comparedStepRate).toBeCloseTo(0.8);
    expect(result.overall.rate).toBeCloseTo(0.2);
    expect(result.overall.comparedRate).toBeCloseTo(0.3);
  });

  it('has no conversion for the first step', () => {
    const result = build(compare({ Sent: 100 }, { Sent: 80 }));

    expect(result.steps[0].stepRate).toBeNull();
    expect(result.steps[0].comparedStepRate).toBeNull();
  });

  it('calculates the percent from the displayed period only', () => {
    const result = build(compare({ Sent: 100, Viewed: 50 }, { Sent: 400, Viewed: 100 }));

    expect(result.values.map((value) => value.percent)).toEqual([1, 0.5]);
  });

  it('measures the changes from the oldest period when it is displayed', () => {
    const result = build(
      compare({ Sent: 100, Viewed: 70 }, { Sent: 100, Viewed: 80 }),
      Sorting.none,
      ComparisonPeriod.oldest
    );

    expect(result.values.map((value) => value.numeric)).toEqual([100, 80]);
    expect(result.steps[1]).toMatchObject({ count: 80, comparedCount: 70, countDelta: 10 });
    expect(result.steps[1].stepRate).toBeCloseTo(0.8);
    expect(result.steps[1].comparedStepRate).toBeCloseTo(0.7);
  });

  it('sorts the steps by the displayed period', () => {
    const selection = compare({ Visit: 100, Signup: 50, Paid: 10 }, { Visit: 90, Signup: 20, Paid: 30 });
    const titles = (sorting: Sorting, period: ComparisonPeriod) =>
      build(selection, sorting, period).values.map((value) => value.title);

    expect(titles(Sorting.descending, ComparisonPeriod.newest)).toEqual(['Visit', 'Signup', 'Paid']);
    expect(titles(Sorting.descending, ComparisonPeriod.oldest)).toEqual(['Visit', 'Paid', 'Signup']);
    expect(titles(Sorting.ascending, ComparisonPeriod.oldest)).toEqual(['Signup', 'Paid', 'Visit']);
  });

  it('pairs one frame per step by the base references', () => {
    const result = build(
      select([
        step('A', 'Sent', 100),
        step('B', 'Bought', 25),
        step('A-compare', 'Sent', 80),
        step('B-compare', 'Bought', 20),
      ])
    );

    expect(result.values.map((value) => value.title)).toEqual(['Sent', 'Bought']);
    expect(result.steps.map((value) => value.comparedCount)).toEqual([80, 20]);
    expect(result.overall.rate).toBeCloseTo(0.25);
    expect(result.overall.comparedRate).toBeCloseTo(0.25);
  });

  it('pairs the fields of one frame by the step names', () => {
    const result = build(compare({ Sent: 100, Bought: 20 }, { Bought: 10, Sent: 100 }));

    expect(result.steps.map((value) => value.comparedCount)).toEqual([100, 10]);
  });

  it('reports different steps instead of comparing them', () => {
    expect(buildError(compare({ Sent: 100, Bought: 20 }, { Sent: 100, Viewed: 20 }))).toEqual({
      kind: 'error',
      reason: 'unmatched-steps',
    });
  });

  it('keeps the count change and leaves the rates unavailable when the denominator is zero', () => {
    const result = build(compare({ Sent: 100, Bought: 20 }, { Sent: 0, Bought: 0 }));

    expect(result.steps[1]).toMatchObject({ countDelta: 20, countDeltaPercent: null, comparedStepRate: null });
    expect(result.steps[1].stepRate).toBeCloseTo(0.2);
    expect(result.overall.comparedRate).toBeNull();
  });

  it.each([
    ['negative counts', { Sent: 100, Bought: -1 }],
    ['non-finite counts', { Sent: 100, Bought: NaN }],
  ])('rejects %s', (_, counts) => {
    expect(buildError(compare(counts, { Sent: 100, Bought: 10 }))).toEqual({ kind: 'error', reason: 'invalid-steps' });
  });

  it('rejects fields with more than one value', () => {
    const current = toDataFrame({ refId: 'A', fields: [{ name: 'Sent', type: FieldType.number, values: [100, 90] }] });

    expect(buildError(select([current, wide('A-compare', { Sent: 100 })]))).toEqual({
      kind: 'error',
      reason: 'invalid-steps',
    });
  });

  it('uses the data links of the displayed period', () => {
    const current = wide('A', { Sent: 100 });
    const previous = wide('A-compare', { Sent: 80 });
    previous.fields[0].config.links = [link];

    expect(build(select([current, previous])).links).toEqual([undefined]);
    expect(build(select([current, previous]), Sorting.none, ComparisonPeriod.oldest).links[0]).toBeInstanceOf(Function);
  });
});
