import { useMemo } from 'react';
import { DataFrame, FieldType, getFieldSeriesColor } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';

export type FunnelDataResult = {
  data: FunnelData[];
  status: 'error' | 'unsupported' | 'success';
};

export type FunnelData = {
  label: string;
  value: number;
  percentage: number;
  color: string;
};

export function useFunnelData(data: DataFrame[]): FunnelDataResult {
  const theme = useTheme2();

  return useMemo(() => {
    const result: FunnelData[] = [];

    for (const frame of data) {
      const labelField = frame.fields.find((f) => f.type === FieldType.string);
      const valueField = frame.fields.find((f) => f.type === FieldType.number);

      if (!labelField || !valueField) {
        continue;
      }

      for (let i = 0; i < frame.length; i++) {
        const value = valueField.values.get(i);
        const label = labelField.values.get(i);
        const color = getFieldSeriesColor(valueField, theme);

        result.push({
          label,
          value,
          percentage: 0,
          color: color.color,
        });
      }
    }

    if (result.length === 0 && data.length > 0) {
      return {
        data: result,
        status: 'unsupported',
      };
    }

    const sorted = result.sort((a, b) => b.value - a.value);
    const max = sorted[0];

    return {
      data: sorted.map((s) => {
        s.percentage = s.value / max.value;
        return s;
      }),
      status: 'success',
    };
  }, [data, theme]);
}
