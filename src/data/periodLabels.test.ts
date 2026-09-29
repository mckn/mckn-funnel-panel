import { dateTime, FieldType, toDataFrame, type TimeRange } from '@grafana/data';
import {
  ComparisonMode,
  ComparisonPeriod,
  Layout,
  Orientation,
  OutcomeDirection,
  Sorting,
  type PanelOptions,
} from 'types';
import { type CompareSelection, selectComparisonFrames } from './comparison';
import { formatOffset, getComparisonPeriodLabels } from './periodLabels';

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

const relativeRange: TimeRange = {
  from: dateTime('2026-09-25T11:30:00Z'),
  to: dateTime('2026-09-25T12:00:00Z'),
  raw: { from: 'now-30m', to: 'now' },
};

const absoluteRange: TimeRange = {
  from: dateTime('2026-09-25T10:00:00Z'),
  to: dateTime('2026-09-25T12:00:00Z'),
  raw: { from: dateTime('2026-09-25T10:00:00Z'), to: dateTime('2026-09-25T12:00:00Z') },
};

function frame(refId: string, diffMs?: number) {
  return toDataFrame({
    refId,
    name: 'Funnel',
    meta: diffMs !== undefined ? { timeCompare: { isTimeShiftQuery: true, diffMs } } : undefined,
    fields: [{ name: 'Sent', type: FieldType.number, values: [100] }],
  });
}

function grafanaSelection(diffMs?: number): CompareSelection {
  const selection = selectComparisonFrames([frame('A'), frame('A-compare', diffMs)], options);
  if (selection.kind !== 'compare') {
    throw new Error('Expected a comparison selection');
  }
  return selection;
}

describe('getComparisonPeriodLabels', () => {
  it('describes the relative range and the Grafana comparison offset', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(-7 * DAY), relativeRange, 'utc', options)).toEqual({
      newest: 'Last 30 minutes',
      oldest: 'Last 30 minutes (1 week ago)',
    });
  });

  it('treats a positive offset as a period in the past', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(DAY), relativeRange, 'utc', options).oldest).toBe(
      'Last 30 minutes (1 day ago)'
    );
  });

  it('shifts an absolute range by the offset', () => {
    const labels = getComparisonPeriodLabels(grafanaSelection(-DAY), absoluteRange, 'utc', options);

    expect(labels.newest).toBe('2026-09-25 10:00:00 to 2026-09-25 12:00:00');
    expect(labels.oldest).toBe('2026-09-24 10:00:00 to 2026-09-24 12:00:00');
  });

  it('does not change the time range of the panel', () => {
    getComparisonPeriodLabels(grafanaSelection(-DAY), absoluteRange, 'utc', options);

    expect(absoluteRange.from.toISOString()).toBe('2026-09-25T10:00:00.000Z');
  });

  it('labels the offset as unavailable when a transformation removes the metadata', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(), relativeRange, 'utc', options).oldest).toBe(
      'Comparison period (time offset unavailable)'
    );
  });

  it('identifies manual periods by their query references', () => {
    const manual = { ...options, comparisonMode: ComparisonMode.manual, currentRefId: 'C', previousRefId: 'D' };
    const selection = selectComparisonFrames([frame('C'), frame('D')], manual);
    if (selection.kind !== 'compare') {
      throw new Error('Expected a comparison selection');
    }

    expect(getComparisonPeriodLabels(selection, relativeRange, 'utc', manual)).toEqual({
      newest: 'Current query (C)',
      oldest: 'Comparison query (D)',
    });
  });
});

describe('formatOffset', () => {
  it.each([
    [-DAY, '1 day ago'],
    [-3 * 60 * 60 * 1000, '3 hours ago'],
    [-36 * 60 * 60 * 1000, '1.5 days ago'],
    [-30 * 1000, '30 seconds ago'],
  ])('formats %d as "%s"', (diffMs, expected) => {
    expect(formatOffset(diffMs)).toBe(expected);
  });
});
