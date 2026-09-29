import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { t, Trans } from '@grafana/i18n';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { type GrafanaTheme2 } from '@grafana/data';
import { OutcomeDirection } from 'types';
import { formatPercentage, formatPointChange, getOutcome, getOutcomeColor, getPointChange, UNAVAILABLE } from 'utils';
import { type RateComparison } from '../../data/comparison';

// Fixed height, so the layout can subtract it before it decides if the steps are compact.
export const COMPARISON_HEADER_HEIGHT = 32;

export type PeriodLabels = {
  selected: string;
  compared: string;
};

type Props = {
  labels: PeriodLabels;
  overall: RateComparison;
  outcomeDirection: OutcomeDirection;
  'data-testid'?: string;
};

export function ComparisonHeader(props: Props): ReactElement {
  const { labels, overall, outcomeDirection } = props;
  const { selected, compared } = labels;
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const change = getPointChange(overall.rate, overall.comparedRate);
  const title = t('components.flow.comparison-periods-title', '{{selected}} compared with {{compared}}', {
    selected,
    compared,
  });

  return (
    <div className={styles.header} data-testid={props['data-testid']}>
      <div className={styles.periods} title={title}>
        <Trans i18nKey="components.flow.comparison-periods" values={{ selected, compared }}>
          <strong className={styles.selected}>{'{{selected}}'}</strong> compared with {'{{compared}}'}
        </Trans>
      </div>
      <div className={styles.overall}>
        <span className={styles.caption}>{t('components.flow.overall-conversion', 'Overall conversion')}</span>
        <span>{overall.rate === null ? UNAVAILABLE : formatPercentage(overall.rate)}</span>
        <span
          style={{ color: getOutcomeColor(getOutcome(change, outcomeDirection), theme) }}
          data-testid="overall-change"
        >
          {formatPointChange(change)}
        </span>
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    header: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing(2),
      height: COMPARISON_HEADER_HEIGHT,
      flexShrink: 0,
      minWidth: 0,
      padding: theme.spacing(0, 2),
      borderBottom: `1px solid ${theme.colors.border.weak}`,
      whiteSpace: 'nowrap',
    }),
    periods: css({
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: theme.colors.text.secondary,
    }),
    selected: css({
      color: theme.colors.text.primary,
      fontWeight: theme.typography.fontWeightMedium,
    }),
    overall: css({
      display: 'flex',
      alignItems: 'baseline',
      gap: theme.spacing(1),
      flexShrink: 0,
      fontWeight: theme.typography.fontWeightMedium,
    }),
    caption: css({
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
      fontWeight: theme.typography.fontWeightRegular,
    }),
  };
};
