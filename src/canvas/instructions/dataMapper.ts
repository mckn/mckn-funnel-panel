import { DataFrame, FieldType, getFieldSeriesColor, GrafanaTheme2 } from '@grafana/data';

export type FunnelData = {
  label: string;
  value: number;
  percent: number;
  color: string;
};

export function dataFramesToFunnelData(data: DataFrame[], theme: GrafanaTheme2): FunnelData[] {
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
        percent: 0,
        color: color.color,
      });
    }
  }

  const sorted = result.sort((a, b) => b.value - a.value);
  const max = sorted[0];

  return sorted.map((s) => {
    s.percent = s.value / max.value;
    return s;
  });
}
