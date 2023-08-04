import { useMemo } from 'react';
import {
  type GetFieldDisplayValuesOptions,
  getFieldDisplayValues,
  type DisplayValue,
  type DataFrame,
} from '@grafana/data';

export enum FunnelDataResultStatus {
  unsupported,
  success,
}

export type FunnelDataResult = {
  values: DisplayValue[];
  status: FunnelDataResultStatus;
};

export function useFunnelData(options: Omit<GetFieldDisplayValuesOptions, 'reduceOptions'>): FunnelDataResult {
  const { theme, data, fieldConfig, replaceVariables, timeZone } = options;

  return useMemo(() => {
    if (!isSupported(data)) {
      return {
        values: [],
        status: FunnelDataResultStatus.unsupported,
      };
    }

    const values = getFieldDisplayValues({
      fieldConfig: fieldConfig,
      reduceOptions: { calcs: [] },
      replaceVariables,
      theme: theme,
      data: data,
      timeZone,
    });

    const displayValues = values.map((v) => v.display);

    return {
      values: sortValues(displayValues),
      status: FunnelDataResultStatus.success,
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

function isSupported(data?: DataFrame[]): boolean {
  if (!data) {
    return false;
  }

  const noOfFields = data.reduce((count, frame) => {
    return count + frame.fields.length;
  }, 0);

  return noOfFields > 1;
}
