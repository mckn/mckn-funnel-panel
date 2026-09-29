import {
  FieldType,
  getFieldDisplayValues,
  type DataFrame,
  type DisplayValue,
  type FieldDisplay,
  type GetFieldDisplayValuesOptions,
} from '@grafana/data';
import { ComparisonMode, ComparisonPeriod, Layout, type PanelOptions, Sorting } from 'types';
import { type LinksSupplier, sortByPercent } from './useFunnelData';

export type ComparisonError = 'missing-period' | 'invalid-steps' | 'unmatched-steps';

export type ComparisonSource = 'grafana' | 'manual';

export type ComparisonSelection =
  | { kind: 'single'; current: DataFrame[] }
  | { kind: 'compare'; current: DataFrame[]; previous: DataFrame[]; source: ComparisonSource }
  | { kind: 'error'; current: DataFrame[]; reason: ComparisonError };

export type CompareSelection = Extract<ComparisonSelection, { kind: 'compare' }>;

// Values of the displayed period compared with the other period. Deltas are displayed minus compared.
export type StepComparison = {
  count: number;
  comparedCount: number;
  comparedValue: DisplayValue;
  countDelta: number;
  // Relative to the compared count, as a 0–1 decimal. Null when the compared count is zero.
  countDeltaPercent: number | null;
  // Conversion from the previous step. Null for the first step or when the previous step is zero.
  stepRate: number | null;
  comparedStepRate: number | null;
};

export type RateComparison = {
  rate: number | null;
  comparedRate: number | null;
};

export type FunnelComparison = {
  // Displayed period, sorted, with percent relative to its own largest step.
  values: DisplayValue[];
  // Same index as values. Undefined when the step has no data links.
  links: LinksSupplier[];
  // Same index as values.
  steps: StepComparison[];
  // Conversion from the first to the last step.
  overall: RateComparison;
};

export type ComparisonResult = ({ kind: 'ready' } & FunnelComparison) | { kind: 'error'; reason: ComparisonError };

export type DisplayOptions = Omit<GetFieldDisplayValuesOptions, 'data' | 'reduceOptions'>;

type Step = {
  key: string;
  count: number;
  fieldDisplay: FieldDisplay;
};

const COMPARE_SUFFIX = '-compare';

export function isGrafanaComparison(frame: DataFrame, frames: DataFrame[]): boolean {
  if (getTimeCompareDiffMs(frame) !== undefined || frame.meta?.timeCompare?.isTimeShiftQuery) {
    return true;
  }
  // Some transformations, like Rows to fields, discard the frame metadata but keep the query reference.
  // Require the original reference as well, so a standalone query named "A-compare" stays ordinary data.
  const baseRefId = getBaseRefId(frame);
  return baseRefId !== frame.refId && frames.some((candidate) => candidate.refId === baseRefId);
}

// Grafana sets the offset on the frame metadata and on the config of every field.
export function getTimeCompareDiffMs(frame: DataFrame): number | undefined {
  if (frame.meta?.timeCompare?.isTimeShiftQuery) {
    return frame.meta.timeCompare.diffMs;
  }
  for (const field of frame.fields) {
    const timeCompare = field.config.custom?.timeCompare;
    if (timeCompare?.isTimeShiftQuery && typeof timeCompare.diffMs === 'number') {
      return timeCompare.diffMs;
    }
  }
  return undefined;
}

export function getComparisonRefIds(options: Pick<PanelOptions, 'currentRefId' | 'previousRefId'>) {
  return {
    currentRefId: (options.currentRefId || 'A').trim(),
    previousRefId: (options.previousRefId || 'B').trim(),
  };
}

export function selectComparisonFrames(frames: DataFrame[], options: PanelOptions): ComparisonSelection {
  // Only the flow layout shows comparisons.
  const mode = options.layout === Layout.flow ? options.comparisonMode ?? ComparisonMode.auto : ComparisonMode.off;
  const unshifted = frames.filter((frame) => !isGrafanaComparison(frame, frames));

  if (mode === ComparisonMode.off) {
    return { kind: 'single', current: unshifted };
  }

  if (mode === ComparisonMode.manual) {
    const { currentRefId, previousRefId } = getComparisonRefIds(options);
    const current = unshifted.filter((frame) => frame.refId === currentRefId);
    const previous = unshifted.filter((frame) => frame.refId === previousRefId);

    if (currentRefId === previousRefId || !current.length || !previous.length) {
      return { kind: 'error', current, reason: 'missing-period' };
    }
    return { kind: 'compare', current, previous, source: 'manual' };
  }

  const previous = frames.filter((frame) => isGrafanaComparison(frame, frames));
  if (!previous.length) {
    return { kind: 'single', current: unshifted };
  }
  if (!unshifted.length) {
    return { kind: 'error', current: [], reason: 'missing-period' };
  }
  return { kind: 'compare', current: unshifted, previous, source: 'grafana' };
}

export function buildComparison(
  selection: CompareSelection,
  displayOptions: DisplayOptions,
  options: Pick<PanelOptions, 'sorting' | 'comparisonPeriod'>
): ComparisonResult {
  const newest = extractSteps(selection.current, selection.source, displayOptions);
  const oldest = extractSteps(selection.previous, selection.source, displayOptions);
  if (!newest || !oldest) {
    return { kind: 'error', reason: 'invalid-steps' };
  }

  const newestByKey = new Map(newest.map((step) => [step.key, step]));
  const oldestByKey = new Map(oldest.map((step) => [step.key, step]));
  if (newest.length !== oldest.length || newest.some((step) => !oldestByKey.has(step.key))) {
    return { kind: 'error', reason: 'unmatched-steps' };
  }

  const showOldest = options.comparisonPeriod === ComparisonPeriod.oldest;
  const comparedByKey = showOldest ? newestByKey : oldestByKey;
  const selected = showOldest ? oldest : newest;

  // Grafana calculates the percent with a range shared by both periods. Use the range of the displayed period.
  const max = Math.max(...selected.map((step) => step.count));
  const getPercent = (step: Step) => (max > 0 ? step.count / max : 0);
  const sorted = sortByPercent([...selected], options.sorting ?? Sorting.descending, getPercent);

  const compared = sorted.map((step) => comparedByKey.get(step.key)!);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  return {
    kind: 'ready',
    values: sorted.map((step) => ({
      ...step.fieldDisplay.display,
      // The labels stay the same when switching between the periods.
      title: newestByKey.get(step.key)!.fieldDisplay.display.title,
      percent: getPercent(step),
    })),
    links: sorted.map(({ fieldDisplay }) => (fieldDisplay.hasLinks ? fieldDisplay.getLinks : undefined)),
    steps: sorted.map((step, i) => {
      const comparedCount = compared[i].count;
      const countDelta = step.count - comparedCount;

      return {
        count: step.count,
        comparedCount,
        comparedValue: compared[i].fieldDisplay.display,
        countDelta,
        countDeltaPercent: rate(countDelta, comparedCount),
        stepRate: i > 0 ? rate(step.count, sorted[i - 1].count) : null,
        comparedStepRate: i > 0 ? rate(comparedCount, compared[i - 1].count) : null,
      };
    }),
    overall: {
      rate: rate(last.count, first.count),
      comparedRate: rate(compared[compared.length - 1].count, compared[0].count),
    },
  };
}

function extractSteps(frames: DataFrame[], source: ComparisonSource, displayOptions: DisplayOptions): Step[] | null {
  const fieldDisplays = getFieldDisplayValues({
    ...displayOptions,
    data: frames,
    reduceOptions: { calcs: [] },
  });
  const steps: Step[] = [];

  for (const frame of frames) {
    const numericFields = frame.fields.filter((field) => field.type === FieldType.number);

    for (const field of numericFields) {
      const count = field.values[0];
      const fieldDisplay = fieldDisplays[steps.length];

      if (field.values.length !== 1 || typeof count !== 'number' || !Number.isFinite(count) || count < 0) {
        return null;
      }
      if (!fieldDisplay) {
        return null;
      }

      // One frame per step uses the frame name, one frame with all steps uses the field names.
      const label = (numericFields.length === 1 && frame.name) || field.name;
      const key = source === 'grafana' ? `${getBaseRefId(frame)}:${label}:${field.name}` : `${label}:${field.name}`;
      steps.push({ key, count, fieldDisplay });
    }
  }

  const unique = new Set(steps.map((step) => step.key)).size === steps.length;
  if (!steps.length || fieldDisplays.length !== steps.length || !unique) {
    return null;
  }
  return steps;
}

function getBaseRefId(frame: DataFrame): string {
  const refId = frame.refId ?? '';
  return refId.endsWith(COMPARE_SUFFIX) ? refId.slice(0, -COMPARE_SUFFIX.length) : refId;
}

function rate(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}
