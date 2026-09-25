import { type IconName } from '@grafana/ui';

export function getDropRate(fromPercent: number, toPercent: number): number {
  return (fromPercent - toPercent) / fromPercent;
}

export function getTrendIconName(fromPercent: number, toPercent: number): IconName {
  if (fromPercent > toPercent) {
    return 'arrow-down';
  }
  if (fromPercent < toPercent) {
    return 'arrow-up';
  }
  return 'arrow-right';
}
