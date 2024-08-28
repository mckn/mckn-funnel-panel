import { type DisplayValue } from '@grafana/data';

export function getDisplayValueKey(value: DisplayValue): string {
  const { percent = 0, text, title } = value;
  return `${text}-${percent}-${title}`;
}
