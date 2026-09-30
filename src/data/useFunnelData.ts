import { useMemo } from 'react';
import {
  type GetFieldDisplayValuesOptions,
  getFieldDisplayValues,
  type DisplayValue,
  type DataFrame,
  type LinkModel,
  FieldType,
} from '@grafana/data';
import { PanelOptions, Sorting } from 'types';

export enum FunnelDataResultStatus {
  unsupported,
  nodata,
  success,
}

export type LinksSupplier = (() => LinkModel[]) | undefined;

export type FunnelDataResult = {
  values: DisplayValue[];
  // Same index as values. Undefined when the step has no data links.
  links: LinksSupplier[];
  status: FunnelDataResultStatus;
};

export function useFunnelData(
  params: Omit<GetFieldDisplayValuesOptions, 'reduceOptions'>,
  options: PanelOptions
): FunnelDataResult {
  const { theme, data, fieldConfig, replaceVariables, timeZone } = params;
  const { sorting } = options;

  return useMemo(() => {
    if (noData(data)) {
      return {
        values: [],
        links: [],
        status: FunnelDataResultStatus.nodata,
      };
    }

    if (!isSupported(data)) {
      return {
        values: [],
        links: [],
        status: FunnelDataResultStatus.unsupported,
      };
    }

    const fieldDisplays = sortByPercent(
      getFieldDisplayValues({
        fieldConfig: fieldConfig,
        reduceOptions: { calcs: [] },
        replaceVariables,
        theme: theme,
        data: data,
        timeZone,
      }),
      sorting,
      (v) => v.display.percent
    );

    return {
      values: fieldDisplays.map((v) => v.display),
      links: fieldDisplays.map((v) => (v.hasLinks ? v.getLinks : undefined)),
      status: FunnelDataResultStatus.success,
    };
  }, [theme, data, fieldConfig, replaceVariables, timeZone, sorting]);
}

export function sortByPercent<T>(values: T[], sorting: Sorting, getPercent: (value: T) => number | undefined): T[] {
  if (sorting === Sorting.none) {
    return values;
  }

  return values.sort((a, b) => {
    const ap = getPercent(a) ?? 0;
    const bp = getPercent(b) ?? 0;

    switch (sorting) {
      case Sorting.ascending:
        return ap - bp;
      default:
        return bp - ap;
    }
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
