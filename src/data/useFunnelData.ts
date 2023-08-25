import { useMemo } from 'react';
import {
  type GetFieldDisplayValuesOptions,
  getFieldDisplayValues,
  type DisplayValue,
  type DataFrame,
  FieldType,
} from '@grafana/data';

export enum FunnelDataResultStatus {
  unsupported,
  nodata,
  success,
}

export type FunnelDataResult = {
  values: DisplayValue[];
  status: FunnelDataResultStatus;
};

export function useFunnelData(options: Omit<GetFieldDisplayValuesOptions, 'reduceOptions'>): FunnelDataResult {
  const { theme, data, fieldConfig, replaceVariables, timeZone } = options;

  return useMemo(() => {
    if (noData(data)) {
      return {
        values: [],
        status: FunnelDataResultStatus.nodata,
      };
    }

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
  if (!data || data.length === 0) {
    return false;
  }

  return data.every((d) => {
    const field = d.fields.find((f) => {
      return f.type === FieldType.number;
    });

    return Boolean(field);
  });
}

function noData(data?: DataFrame[]): boolean {
  return !data || data.length === 0;
}
