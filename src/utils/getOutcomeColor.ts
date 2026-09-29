import { type GrafanaTheme2 } from '@grafana/data';
import { OutcomeDirection } from 'types';

export type Outcome = 'favorable' | 'unfavorable' | 'neutral';

export function getOutcome(change: number | null, direction: OutcomeDirection): Outcome {
  if (change === null || change === 0) {
    return 'neutral';
  }
  const increased = change > 0;
  return increased === (direction === OutcomeDirection.higher) ? 'favorable' : 'unfavorable';
}

export function getOutcomeColor(outcome: Outcome, theme: GrafanaTheme2): string {
  switch (outcome) {
    case 'favorable':
      return theme.colors.success.text;
    case 'unfavorable':
      return theme.colors.error.text;
    default:
      return theme.colors.text.secondary;
  }
}
