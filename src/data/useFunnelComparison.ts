import { useMemo } from 'react';
import { type DataFrame, type GetFieldDisplayValuesOptions } from '@grafana/data';
import { type PanelOptions } from 'types';
import { buildComparison, type ComparisonError, type FunnelComparison, selectComparisonFrames } from './comparison';

export type FunnelComparisonResult = {
  // Frames of the current period, for the funnel without a comparison.
  current: DataFrame[];
  // Set when the flow layout can compare the current period with the Grafana Time comparison period.
  comparison?: FunnelComparison;
  // Set when the data has a comparison period, but the panel can not compare it.
  error?: ComparisonError;
};

export function useFunnelComparison(
  params: Omit<GetFieldDisplayValuesOptions, 'reduceOptions'>,
  options: Pick<PanelOptions, 'layout' | 'sorting' | 'comparisonPeriod'>
): FunnelComparisonResult {
  const { theme, data, fieldConfig, replaceVariables, timeZone } = params;
  const { layout, sorting, comparisonPeriod } = options;

  const selection = useMemo(() => selectComparisonFrames(data ?? [], { layout }), [data, layout]);

  return useMemo(() => {
    if (selection.kind === 'single') {
      return { current: selection.current };
    }
    if (selection.kind === 'error') {
      return { current: selection.current, error: selection.reason };
    }

    const result = buildComparison(
      selection,
      { fieldConfig, replaceVariables, theme, timeZone },
      { sorting, comparisonPeriod }
    );

    if (result.kind === 'error') {
      return { current: selection.current, error: result.reason };
    }
    return { current: selection.current, comparison: result };
  }, [selection, fieldConfig, replaceVariables, theme, timeZone, sorting, comparisonPeriod]);
}
