import { useMemo } from 'react';
import { type GetFieldDisplayValuesOptions, getFieldDisplayValues, type DisplayValue } from '@grafana/data';

export type FunnelDataResult = {
  values: DisplayValue[];
  status: 'error' | 'unsupported' | 'success';
};

export function useFunnelData(options: Omit<GetFieldDisplayValuesOptions, 'reduceOptions'>): FunnelDataResult {
  const { theme, data, fieldConfig, replaceVariables, timeZone } = options;

  return useMemo(() => {
    const values = getFieldDisplayValues({
      fieldConfig: fieldConfig,
      reduceOptions: { calcs: [] },
      replaceVariables,
      theme: theme,
      data: data,
      timeZone,
    }).map((v) => v.display);

    if (values.length === 0) {
      return {
        values: [],
        status: 'unsupported',
      };
    }

    return {
      values: sortValues(values),
      status: 'success',
    };
  }, [theme, data, fieldConfig, replaceVariables, timeZone]);
}

function sortValues(values: DisplayValue[]): DisplayValue[] {
  return values.sort((a, b) => {
    const ap = a.percent ?? 0;
    const bp = b.percent ?? 0;

    return bp - ap;
  });
}
