import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { useStyles2 } from '@grafana/ui';
import { type FunnelData } from 'data';

type Props = {
  from: FunnelData;
  to?: FunnelData;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to } = props;
  const styles = useStyles2(getStyles(from, to));

  return Boolean(to) ? <div className={styles.barGap} /> : null;
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
      backgroundColor: color,
      flexGrow: 1,
      clipPath: `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`,
      width: '100%',
    }),
  };
};
