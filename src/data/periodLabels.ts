import { dateTime, rangeUtil, type TimeRange } from '@grafana/data';
import { type TimeZone } from '@grafana/schema';
import { t } from '@grafana/i18n';
import { type CompareSelection, getTimeCompareDiffMs } from './comparison';

export type ComparisonPeriodLabels = {
  newest: string;
  oldest: string;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const OFFSET_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; milliseconds: number }> = [
  { unit: 'year', milliseconds: 365.25 * DAY },
  { unit: 'month', milliseconds: 30.44 * DAY },
  { unit: 'week', milliseconds: 7 * DAY },
  { unit: 'day', milliseconds: DAY },
  { unit: 'hour', milliseconds: HOUR },
  { unit: 'minute', milliseconds: MINUTE },
  { unit: 'second', milliseconds: SECOND },
];

export function getComparisonPeriodLabels(
  selection: CompareSelection,
  timeRange: TimeRange,
  timeZone: TimeZone
): ComparisonPeriodLabels {
  const range = rangeUtil.describeTimeRange(timeRange.raw, timeZone);
  const diffMs = selection.previous.map(getTimeCompareDiffMs).find((value) => value !== undefined);

  if (diffMs === undefined) {
    return {
      newest: range,
      oldest: t('components.comparison.offset-unavailable', 'Comparison period (time offset unavailable)'),
    };
  }

  if (diffMs === 0) {
    return { newest: range, oldest: t('components.comparison.same-time-range', 'Same time range') };
  }

  // Grafana compares with a period in the past. Its alignment code accepts both signs, so do the same.
  const offsetMs = -Math.abs(diffMs);

  if (!rangeUtil.isRelativeTimeRange(timeRange.raw)) {
    const shifted = {
      from: dateTime(timeRange.from).add(offsetMs, 'millisecond'),
      to: dateTime(timeRange.to).add(offsetMs, 'millisecond'),
    };
    return { newest: range, oldest: rangeUtil.describeTimeRange(shifted, timeZone) };
  }

  return {
    newest: range,
    oldest: t('components.comparison.shifted-range', '{{range}} ({{offset}})', {
      range,
      offset: formatOffset(offsetMs),
    }),
  };
}

// A negative offset is in the past, for example "1 day ago".
export function formatOffset(diffMs: number): string {
  const absolute = Math.abs(diffMs);
  const { unit, milliseconds } =
    OFFSET_UNITS.find((candidate) => absolute >= candidate.milliseconds) ?? OFFSET_UNITS[OFFSET_UNITS.length - 1];
  const amount = Math.round((absolute / milliseconds) * 10) / 10;

  return new Intl.RelativeTimeFormat(undefined, { numeric: 'always' }).format(Math.sign(diffMs) * amount, unit);
}
