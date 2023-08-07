import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { Icon, type IconName, useStyles2 } from '@grafana/ui';
import { formatPercentage } from '../utils';
import { useTooltipProps, BarGapTooltip } from './Tooltip';
import { type DisplayValue } from '@grafana/data';

type Props = {
  from: DisplayValue;
  to?: DisplayValue;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to } = props;
  const styles = useStyles2(getStyles(from, to));

  const toPercentage = to?.percent ?? 0;
  const fromPercentage = from?.percent ?? 0;
  const drop = toPercentage / fromPercentage;
  const icon = getIconName(fromPercentage, toPercentage);
  const tooltipProps = useTooltipProps({
    content: <BarGapTooltip drop={drop} fromLabel={from.title ?? ''} toLabel={to?.title} />,
  });

  if (!Boolean(to)) {
    return null;
  }

  return (
    <div {...tooltipProps} className={styles.barGap}>
      <div className={styles.percentage}>
        <Icon name={icon} />
        {' ' + formatPercentage(drop)}
      </div>
    </div>
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

const getStyles = (from: DisplayValue, to?: DisplayValue) => () => {
  if (!to) {
    return {};
  }

  const toPercent = to.percent ?? 0;
  const fromPercent = from.percent ?? 0;
  const color = tinycolor(from.color).darken(15).toHexString();
  const topLeft = 100 * ((1 - fromPercent) / 2);
  const topRight = 100 - topLeft;
  const bottomLeft = 100 * ((1 - toPercent) / 2);
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
      width: `${toPercent * 100}%`,
      justifyContent: 'center',
      alignItems: 'center',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };
};
