import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { Icon, useStyles2 } from '@grafana/ui';
import {
  formatPercentage,
  getDropRate,
  getPercentageExtraStyles,
  getTrapezoidClipPath,
  getTrendIconName,
} from '../utils';
import { useTooltipProps, BarGapTooltip } from './Tooltip';
import { GrafanaTheme2, type DisplayValue } from '@grafana/data';

type Props = {
  from: DisplayValue;
  to?: DisplayValue;
  textColor: string;
  showRemainedPercentage: boolean;
  'data-testid'?: string;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to, textColor, showRemainedPercentage } = props;
  const styles = useStyles2(getStyles(from, to, textColor));

  const toPercentage = to?.percent ?? 0;
  const fromPercentage = from?.percent ?? 0;
  const drop = getDropRate(fromPercentage, toPercentage);
  const icon = getTrendIconName(fromPercentage, toPercentage);
  const tooltipProps = useTooltipProps({
    content: (
      <BarGapTooltip
        drop={drop}
        fromLabel={from.title ?? ''}
        toLabel={to?.title}
        showRemainedPercentage={showRemainedPercentage}
      />
    ),
  });

  if (!Boolean(to)) {
    return null;
  }

  return (
    <div {...tooltipProps} className={styles.container} data-testid={props['data-testid']}>
      <div className={styles.barGap} />
      <div className={styles.percentage}>
        <Icon name={icon} />
        {' ' + formatPercentage(showRemainedPercentage ?? true ? 1 - drop : drop)}
      </div>
    </div>
  );
}

const getStyles = (from: DisplayValue, to: DisplayValue | undefined, textColor: string) => (theme: GrafanaTheme2) => {
  if (!to) {
    return {};
  }

  const toPercent = to.percent ?? 0;
  const fromPercent = from.percent ?? 0;
  const bgColor = tinycolor(from.color).darken(15).toHexString();

  return {
    container: css({
      position: 'relative',
      display: 'flex',
      flexGrow: 2,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    barGap: css({
      width: '100%',
      height: '100%',
      backgroundColor: bgColor,
      clipPath: getTrapezoidClipPath(fromPercent, toPercent),
    }),
    percentage: css({
      display: 'flex',
      position: 'absolute',
      color: textColor,
      justifyContent: 'center',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...getPercentageExtraStyles(theme, textColor, bgColor),
    }),
  };
};
