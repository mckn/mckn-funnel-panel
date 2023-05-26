import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { useStyles2 } from '@grafana/ui';
import { type FunnelData } from 'data';
import { formatPercentage } from './Percentages';

type Props = {
  from: FunnelData;
  to?: FunnelData;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to } = props;
  const styles = useStyles2(getStyles(from, to));

  const toPercentage = to?.percentage ?? 0;
  const fromPercentage = from?.percentage ?? 0;
  const drop = toPercentage / fromPercentage;

  console.log({ drop, to: to?.percentage, from: from.percentage });

  if (!Boolean(to)) {
    return null;
  }

  return (
    <div className={styles.barGap}>
      <div className={styles.percentage}>{formatPercentage(drop)}</div>
    </div>
  );
}

const getStyles = (from: FunnelData, to?: FunnelData) => () => {
  if (!to) {
    return {};
  }

  const color = tinycolor(from.color).darken(15).toHexString();
  const topLeft = 100 * ((1 - from.percentage) / 2);
  const topRight = 100 - topLeft;
  const bottomLeft = 100 * ((1 - to.percentage) / 2);
  const bottomRight = 100 - bottomLeft;

  return {
    barGap: css({
      display: 'flex',
      backgroundColor: color,
      flexGrow: 1,
      clipPath: `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    percentage: css({
      display: 'flex',
      width: `${to.percentage * 100}%`,
      justifyContent: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };
};
