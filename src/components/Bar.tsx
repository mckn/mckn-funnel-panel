import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { FormattedValueDisplay, useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { BarTooltip, useTooltipProps } from './Tooltip';

type Props = {
  value: DisplayValue;
};

export function Bar(props: Props): ReactElement {
  const { value } = props;
  const { color, title = '', percent = 0, numeric } = value;
  const styles = useStyles2(getStyles(color!));
  const tooltipProps = useTooltipProps({
    content: <BarTooltip label={title} value={numeric} percentage={percent} />,
  });

  return (
    <div {...tooltipProps} className={styles.bar} style={{ width: `${percent * 100}%` }}>
      <p className={styles.text}>
        <FormattedValueDisplay value={value} />
      </p>
    </div>
  );
}

const getStyles = (color: string) => (theme: GrafanaTheme2) => {
  return {
    bar: css({
      flexGrow: 2,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    text: css({
      margin: 0,
      color: theme.colors.text.maxContrast,
      paddingLeft: '5px',
      paddingRight: '5px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };
};
