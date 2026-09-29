import { dateTime, FieldType, toDataFrame, type TimeRange } from '@grafana/data';
import { Layout } from 'types';
import { type CompareSelection, selectComparisonFrames } from './comparison';
import { formatOffset, getComparisonPeriodLabels } from './periodLabels';

const DAY = 24 * 60 * 60 * 1000;

const flow = { layout: Layout.flow };

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
  const selection = selectComparisonFrames([frame('A'), frame('A-compare', diffMs)], flow);
  if (selection.kind !== 'compare') {
    throw new Error('Expected a comparison selection');
  }
  return selection;
}

describe('getComparisonPeriodLabels', () => {
  it('describes the relative range and the Grafana comparison offset', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(-7 * DAY), relativeRange, 'utc')).toEqual({
      newest: 'Last 30 minutes',
      oldest: 'Last 30 minutes (1 week ago)',
    });
  });

  it('treats a positive offset as a period in the past', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(DAY), relativeRange, 'utc').oldest).toBe(
      'Last 30 minutes (1 day ago)'
    );
  });

  it('shifts an absolute range by the offset', () => {
    const labels = getComparisonPeriodLabels(grafanaSelection(-DAY), absoluteRange, 'utc');

    expect(labels.newest).toBe('2026-09-25 10:00:00 to 2026-09-25 12:00:00');
    expect(labels.oldest).toBe('2026-09-24 10:00:00 to 2026-09-24 12:00:00');
  });

  it('does not change the time range of the panel', () => {
    getComparisonPeriodLabels(grafanaSelection(-DAY), absoluteRange, 'utc');

    expect(absoluteRange.from.toISOString()).toBe('2026-09-25T10:00:00.000Z');
  });

  it('labels the offset as unavailable when a transformation removes the metadata', () => {
    expect(getComparisonPeriodLabels(grafanaSelection(), relativeRange, 'utc').oldest).toBe(
      'Comparison period (time offset unavailable)'
    );
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
