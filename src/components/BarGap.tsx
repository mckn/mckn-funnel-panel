import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { Icon, type IconName, useStyles2 } from '@grafana/ui';
import { formatPercentage } from '../utils';
import { useTooltipProps, BarGapTooltip } from './Tooltip';
import { GrafanaTheme2, type DisplayValue } from '@grafana/data';
import { ChartData } from './Chart';

type Props = {
  from: DisplayValue;
  to?: DisplayValue;
  chart: ChartData;
  'data-testid'?: string;
};

export function BarGap(props: Props): ReactElement | null {
  const { from, to, chart } = props;
  const styles = useStyles2(getStyles(from, to, chart));

  const toPercentage = to?.percent ?? 0;
  const fromPercentage = from?.percent ?? 0;
  const drop = (fromPercentage - toPercentage) / fromPercentage;
  const icon = getIconName(fromPercentage, toPercentage);
  const tooltipProps = useTooltipProps({
    content: <BarGapTooltip drop={drop} fromLabel={from.title ?? ''} toLabel={to?.title} />,
  });

  if (!Boolean(to)) {
    return null;
  }

  return (
    <div {...tooltipProps} className={styles.container} data-testid={props['data-testid']}>
      <div className={styles.barGap} />
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

const getStyles = (from: DisplayValue, to: DisplayValue | undefined, chart: ChartData) => (theme: GrafanaTheme2) => {
  if (!to) {
    return {};
  }

  const toPercent = to.percent ?? 0;
  const fromPercent = from.percent ?? 0;
  const bgColor = tinycolor(from.color).darken(15).toHexString();
  const textColor = theme.colors.getContrastText(chart.backgroundColor ?? bgColor, theme.colors.contrastThreshold);
  const topLeft = 100 * ((1 - fromPercent) / 2);
  const topRight = 100 - topLeft;
  const bottomLeft = 100 * ((1 - toPercent) / 2);
  const bottomRight = 100 - bottomLeft;

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
      clipPath: `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`,
    }),
    percentage: css({
      display: 'flex',
      position: 'absolute',
      color: textColor,
      width: `${toPercent * 100}%`,
      justifyContent: 'center',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    }),
  };
};
