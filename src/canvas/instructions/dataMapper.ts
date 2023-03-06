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
    const labelIndex = frame.fields.findIndex((f) => f.type === FieldType.string);
    const valueIndex = frame.fields.findIndex((f) => f.type === FieldType.number);

    for (let i = 0; i < frame.length; i++) {
      const value = frame.fields[valueIndex].values.get(i);
      const label = frame.fields[labelIndex].values.get(i);
      const color = getFieldSeriesColor(frame.fields[valueIndex], theme);

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
