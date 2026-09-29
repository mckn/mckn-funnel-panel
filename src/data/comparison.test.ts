import { createTheme, FieldType, toDataFrame, type DataFrame } from '@grafana/data';
import {
  ComparisonMode,
  ComparisonPeriod,
  Layout,
  Orientation,
  OutcomeDirection,
  Sorting,
  type PanelOptions,
} from 'types';
import { buildComparison, type CompareSelection, selectComparisonFrames } from './comparison';

const DAY = 24 * 60 * 60 * 1000;

const options: PanelOptions = {
  layout: Layout.flow,
  orientation: Orientation.vertical,
  sorting: Sorting.none,
  showRemainedPercentage: false,
  showPercentage: true,
  comparisonMode: ComparisonMode.auto,
  currentRefId: 'A',
  previousRefId: 'B',
  comparisonPeriod: ComparisonPeriod.newest,
  outcomeDirection: OutcomeDirection.higher,
};

const manual: PanelOptions = { ...options, comparisonMode: ComparisonMode.manual };

const displayOptions = {
  fieldConfig: { defaults: {}, overrides: [] },
  replaceVariables: (value: string) => value,
  theme: createTheme(),
  timeZone: 'utc',
};

const timeCompare = { isTimeShiftQuery: true, diffMs: -DAY };

const link = { title: 'Details', url: '/details' };

// One frame with a numeric field per step.
function wide(refId: string, counts: Record<string, number>, compare = false): DataFrame {
  return toDataFrame({
    refId,
    name: 'Funnel',
    meta: compare ? { timeCompare } : undefined,
    fields: Object.entries(counts).map(([name, value]) => ({ name, type: FieldType.number, values: [value] })),
  });
}

// One frame per step.
function step(refId: string, name: string, count: number, compare = false): DataFrame {
  return toDataFrame({
    refId,
    name,
    meta: compare ? { timeCompare } : undefined,
    fields: [{ name: 'Value', type: FieldType.number, values: [count] }],
  });
}

function select(frames: DataFrame[], panelOptions: PanelOptions = options): CompareSelection {
  const selection = selectComparisonFrames(frames, panelOptions);
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

describe('selectComparisonFrames', () => {
  it('detects the Grafana Time comparison metadata', () => {
    const selection = select([wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 }, true)]);

    expect(selection.source).toBe('grafana');
    expect(selection.current.map((frame) => frame.refId)).toEqual(['A']);
    expect(selection.previous.map((frame) => frame.refId)).toEqual(['A-compare']);
  });

  it('detects the Grafana Time comparison field config', () => {
    const compare = toDataFrame({
      refId: 'X',
      fields: [{ name: 'Sent', type: FieldType.number, values: [80], config: { custom: { timeCompare } } }],
    });

    expect(select([wide('A', { Sent: 100 }), compare]).previous).toEqual([compare]);
  });

  it('detects paired comparison references after a transformation removes the metadata', () => {
    expect(select([wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 })]).source).toBe('grafana');
  });

  it('does not treat a standalone comparison reference as a comparison', () => {
    const selection = selectComparisonFrames([wide('A-compare', { Sent: 100 })], options);

    expect(selection.kind).toBe('single');
  });

  it('shows a single funnel without a comparison period', () => {
    expect(selectComparisonFrames([wide('A', { Sent: 100 })], options).kind).toBe('single');
  });

  it('uses the selected query references in manual mode', () => {
    const selection = select([wide('C', { Sent: 100 }), wide('D', { Sent: 80 })], {
      ...manual,
      currentRefId: ' C ',
      previousRefId: 'D',
    });

    expect(selection.source).toBe('manual');
    expect(selection.current.map((frame) => frame.refId)).toEqual(['C']);
    expect(selection.previous.map((frame) => frame.refId)).toEqual(['D']);
  });

  it('reports a missing period in manual mode', () => {
    const selection = selectComparisonFrames([wide('A', { Sent: 100 })], manual);

    expect(selection).toMatchObject({ kind: 'error', reason: 'missing-period' });
  });

  it('reports a missing period when both references are the same', () => {
    const selection = selectComparisonFrames([wide('A', { Sent: 100 })], { ...manual, previousRefId: 'A' });

    expect(selection).toMatchObject({ kind: 'error', reason: 'missing-period' });
  });

  it('removes the comparison frames when comparison is off', () => {
    const frames = [wide('A', { Sent: 100 }), wide('B', { Sent: 90 }), wide('A-compare', { Sent: 80 }, true)];
    const selection = selectComparisonFrames(frames, { ...options, comparisonMode: ComparisonMode.off });

    expect(selection.kind).toBe('single');
    expect(selection.current.map((frame) => frame.refId)).toEqual(['A', 'B']);
  });

  it('does not compare in the classic layout', () => {
    const frames = [wide('A', { Sent: 100 }), wide('A-compare', { Sent: 80 }, true)];
    const selection = selectComparisonFrames(frames, { ...manual, layout: Layout.classic });

    expect(selection.kind).toBe('single');
    expect(selection.current.map((frame) => frame.refId)).toEqual(['A']);
  });
});

describe('buildComparison', () => {
  it('compares conversion rates independently of the traffic volume', () => {
    const result = build(
      select([
        wide('A', { Sent: 100, Viewed: 70, Purchased: 20 }),
        wide('A-compare', { Sent: 200, Viewed: 160, Purchased: 60 }, true),
      ])
    );

    expect(result.values.map((value) => value.title)).toEqual(['Sent', 'Viewed', 'Purchased']);
    expect(result.steps[1]).toMatchObject({ count: 70, comparedCount: 160, countDelta: -90 });
    expect(result.steps[1].countDeltaPercent).toBeCloseTo(-0.5625);
    expect(result.steps[1].stepRate).toBeCloseTo(0.7);
    expect(result.steps[1].comparedStepRate).toBeCloseTo(0.8);
    expect(result.overall.rate).toBeCloseTo(0.2);
    expect(result.overall.comparedRate).toBeCloseTo(0.3);
  });

  it('has no conversion for the first step', () => {
    const result = build(select([wide('A', { Sent: 100 }), wide('B', { Sent: 80 })], manual));

    expect(result.steps[0].stepRate).toBeNull();
    expect(result.steps[0].comparedStepRate).toBeNull();
  });

  it('calculates the percent from the displayed period only', () => {
    const result = build(select([wide('A', { Sent: 100, Viewed: 50 }), wide('B', { Sent: 400, Viewed: 100 })], manual));

    expect(result.values.map((value) => value.percent)).toEqual([1, 0.5]);
  });

  it('measures the changes from the oldest period when it is displayed', () => {
    const result = build(
      select([wide('A', { Sent: 100, Viewed: 70 }), wide('B', { Sent: 100, Viewed: 80 })], manual),
      Sorting.none,
      ComparisonPeriod.oldest
    );

    expect(result.values.map((value) => value.numeric)).toEqual([100, 80]);
    expect(result.steps[1]).toMatchObject({ count: 80, comparedCount: 70, countDelta: 10 });
    expect(result.steps[1].stepRate).toBeCloseTo(0.8);
    expect(result.steps[1].comparedStepRate).toBeCloseTo(0.7);
  });

  it('sorts the steps by the displayed period', () => {
    const selection = select(
      [wide('A', { Visit: 100, Signup: 50, Paid: 10 }), wide('B', { Visit: 90, Signup: 20, Paid: 30 })],
      manual
    );

    expect(build(selection, Sorting.descending).values.map((value) => value.title)).toEqual([
      'Visit',
      'Signup',
      'Paid',
    ]);
    expect(build(selection, Sorting.descending, ComparisonPeriod.oldest).values.map((value) => value.title)).toEqual([
      'Visit',
      'Paid',
      'Signup',
    ]);
    expect(build(selection, Sorting.ascending, ComparisonPeriod.oldest).values.map((value) => value.title)).toEqual([
      'Signup',
      'Paid',
      'Visit',
    ]);
  });

  it('pairs one frame per step by the base references', () => {
    const result = build(
      select([
        step('A', 'Sent', 100),
        step('B', 'Bought', 25),
        step('A-compare', 'Sent', 80, true),
        step('B-compare', 'Bought', 20, true),
      ])
    );

    expect(result.values.map((value) => value.title)).toEqual(['Sent', 'Bought']);
    expect(result.steps.map((value) => value.comparedCount)).toEqual([80, 20]);
    expect(result.overall.rate).toBeCloseTo(0.25);
    expect(result.overall.comparedRate).toBeCloseTo(0.25);
  });

  it('pairs manual frames by the step names', () => {
    const result = build(select([wide('A', { Sent: 100, Bought: 20 }), wide('B', { Bought: 10, Sent: 100 })], manual));

    expect(result.steps.map((value) => value.comparedCount)).toEqual([100, 10]);
  });

  it('reports different steps instead of comparing them', () => {
    const selection = select([wide('A', { Sent: 100, Bought: 20 }), wide('B', { Sent: 100, Viewed: 20 })], manual);

    expect(
      buildComparison(selection, displayOptions, { sorting: Sorting.none, comparisonPeriod: ComparisonPeriod.newest })
    ).toEqual({
      kind: 'error',
      reason: 'unmatched-steps',
    });
  });

  it('keeps the count change and leaves the rates unavailable when the denominator is zero', () => {
    const result = build(select([wide('A', { Sent: 100, Bought: 20 }), wide('B', { Sent: 0, Bought: 0 })], manual));

    expect(result.steps[1]).toMatchObject({ countDelta: 20, countDeltaPercent: null, comparedStepRate: null });
    expect(result.steps[1].stepRate).toBeCloseTo(0.2);
    expect(result.overall.comparedRate).toBeNull();
  });

  it.each([
    ['negative counts', { Sent: 100, Bought: -1 }],
    ['non-finite counts', { Sent: 100, Bought: NaN }],
  ])('rejects %s', (_, counts) => {
    const selection = select([wide('A', counts), wide('B', { Sent: 100, Bought: 10 })], manual);

    expect(
      buildComparison(selection, displayOptions, { sorting: Sorting.none, comparisonPeriod: ComparisonPeriod.newest })
    ).toEqual({
      kind: 'error',
      reason: 'invalid-steps',
    });
  });

  it('rejects fields with more than one value', () => {
    const frame = toDataFrame({ refId: 'A', fields: [{ name: 'Sent', type: FieldType.number, values: [100, 90] }] });
    const selection = select([frame, wide('B', { Sent: 100 })], manual);

    expect(
      buildComparison(selection, displayOptions, { sorting: Sorting.none, comparisonPeriod: ComparisonPeriod.newest })
    ).toEqual({
      kind: 'error',
      reason: 'invalid-steps',
    });
  });

  it('uses the data links of the displayed period', () => {
    const current = wide('A', { Sent: 100 });
    const previous = wide('B', { Sent: 80 });
    previous.fields[0].config.links = [link];

    expect(build(select([current, previous], manual)).links).toEqual([undefined]);
    expect(build(select([current, previous], manual), Sorting.none, ComparisonPeriod.oldest).links[0]).toBeInstanceOf(
      Function
    );
  });
});
