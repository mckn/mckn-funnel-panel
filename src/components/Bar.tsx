import React, { CSSProperties, type ReactElement } from 'react';
import { css } from '@emotion/css';
import { FormattedValueDisplay, useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { BarTooltip, useTooltipProps } from './Tooltip';
import { getPercentageExtraStyles } from 'utils';

type Props = {
  value: DisplayValue;
  textColor: string;
  'data-testid'?: string;
};

export function Bar(props: Props): ReactElement {
  const { value, textColor } = props;
  const { color, title = '', percent = 0, numeric } = value;
  const styles = useStyles2(getStyles(color!, textColor));
  const tooltipProps = useTooltipProps({
    content: <BarTooltip label={title} value={numeric} percentage={percent} />,
  });

  return (
    <div {...tooltipProps} className={styles.bar} style={createBarStyle(percent)} data-testid={props['data-testid']}>
      <p className={styles.text}>
        <FormattedValueDisplay value={value} />
      </p>
    </div>
  );
}

function createBarStyle(percent: number): CSSProperties {
  if (percent > 0 && percent < 0.01) {
    return { width: `0.1%` };
  }
  return { width: `${percent * 100}%` };
}

const getStyles = (bgColor: string, textColor: string) => (theme: GrafanaTheme2) => {
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
      ...getPercentageExtraStyles(theme, textColor, bgColor),
    }),
  };
};
