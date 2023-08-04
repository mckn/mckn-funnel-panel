import { DisplayValue } from '@grafana/data';

export function getDisplayValueKey(value: DisplayValue): string {
  const { percent = 0, text } = value;
  return `${text}-${percent}`;
}
