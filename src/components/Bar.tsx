import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { FormattedValueDisplay, useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { BarTooltip, useTooltipProps } from './Tooltip';
import { ChartData } from './Chart';
import tinycolor from 'tinycolor2';

type Props = {
  value: DisplayValue;
  chart: ChartData;
  'data-testid'?: string;
};

export function Bar(props: Props): ReactElement {
  const { value, chart } = props;
  const { color, title = '', percent = 0, numeric } = value;
  const styles = useStyles2(getStyles(color!, chart));
  const tooltipProps = useTooltipProps({
    content: <BarTooltip label={title} value={numeric} percentage={percent} />,
  });

  return (
    <div
      {...tooltipProps}
      className={styles.bar}
      style={{ width: `${percent * 100}%` }}
      data-testid={props['data-testid']}
    >
      <p className={styles.text}>
        <FormattedValueDisplay value={value} />
      </p>
    </div>
  );
}

const getStyles = (bgColor: string, chart: ChartData) => (theme: GrafanaTheme2) => {
  const textColor = theme.colors.getContrastText(chart.backgroundColor ?? bgColor, theme.colors.contrastThreshold);

  // Color of text over Grafana background. This happen when width of funnel's
  // end is smaller than text length.
  const textColorOverflow = theme.colors.getContrastText(
    theme.colors.background.primary,
    theme.colors.contrastThreshold
  );
  const textExtraStyle =
    tinycolor(textColor).isLight() === tinycolor(textColorOverflow).isLight()
      ? {}
      : {
          backgroundColor: tinycolor(bgColor).setAlpha(0.8).toRgbString(),
          borderRadius: '0.25em',
        };

  return {
    bar: css({
      flexGrow: 2,
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    text: css({
      margin: 0,
      color: textColor,
      paddingLeft: '5px',
      paddingRight: '5px',
      whiteSpace: 'nowrap',
      ...textExtraStyle,
    }),
  };
};
