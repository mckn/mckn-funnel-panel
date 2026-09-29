import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { t } from '@grafana/i18n';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { type GrafanaTheme2 } from '@grafana/data';
import { OutcomeDirection } from 'types';
import { formatPercentage, formatPointChange, getOutcome, getOutcomeColor, getPointChange, UNAVAILABLE } from 'utils';
import { type RateComparison } from '../../data/comparison';

// Fixed height, so the layout can subtract it before it decides if the steps are compact.
export const COMPARISON_HEADER_HEIGHT = 32;

type Props = {
  overall: RateComparison;
  outcomeDirection: OutcomeDirection;
  'data-testid'?: string;
};

// Grafana shows the compared period in the panel title, so the header shows the overall conversion only.
export function ComparisonHeader(props: Props): ReactElement {
  const { overall, outcomeDirection } = props;
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const change = getPointChange(overall.rate, overall.comparedRate);

  return (
    <div className={styles.header} data-testid={props['data-testid']}>
      <span className={styles.caption}>{t('components.flow.overall-conversion', 'Overall conversion')}</span>
      <span>{overall.rate === null ? UNAVAILABLE : formatPercentage(overall.rate)}</span>
      <span
        style={{ color: getOutcomeColor(getOutcome(change, outcomeDirection), theme) }}
        data-testid="overall-change"
      >
        {formatPointChange(change)}
      </span>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    header: css({
      display: 'flex',
      alignItems: 'baseline',
      gap: theme.spacing(1),
      height: COMPARISON_HEADER_HEIGHT,
      lineHeight: `${COMPARISON_HEADER_HEIGHT}px`,
      flexShrink: 0,
      minWidth: 0,
      padding: theme.spacing(0, 2),
      borderBottom: `1px solid ${theme.colors.border.weak}`,
      whiteSpace: 'nowrap',
      fontWeight: theme.typography.fontWeightMedium,
    }),
    caption: css({
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
      fontWeight: theme.typography.fontWeightRegular,
    }),
  };
};
