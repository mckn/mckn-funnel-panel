import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { Icon, IconName, useStyles2 } from '@grafana/ui';
import { type FunnelData } from 'data';
import { formatPercentage } from './Percentages';
import { useTooltip } from './Tooltip';

type Props = {
  from: FunnelData;
  to?: FunnelData;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to } = props;
  const styles = useStyles2(getStyles(from, to));
  const [tooltipId, Tooltip] = useTooltip('bargap');

  const toPercentage = to?.percentage ?? 0;
  const fromPercentage = from?.percentage ?? 0;
  const drop = toPercentage / fromPercentage;
  const icon = getIconName(fromPercentage, toPercentage);

  if (!Boolean(to)) {
    return null;
  }

  return (
    <>
      <div className={styles.barGap} data-tooltip-id={tooltipId}>
        <div className={styles.percentage}>
          <Icon name={icon} />
          {' ' + formatPercentage(drop)}
        </div>
      </div>
      <Tooltip>Testing 123</Tooltip>
    </>
  );
}

function getIconName(from: number, to: number): IconName {
  if (from > to) {
    return 'arrow-down';
  }
  if (from < to) {
    return 'arrow-up';
  }
  return 'arrow-right';
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
      alignItems: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };
};
