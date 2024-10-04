import React, { type ReactElement, Fragment } from 'react';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { BarGap } from './BarGap';
import { Bar } from './Bar';
import { TooltipProvider } from './Tooltip';
import { type DisplayValue } from '@grafana/data';
import { getContrastText, getDisplayValueKey } from '../utils';

type Props = {
  values: DisplayValue[];
};

export function Chart(props: Props): ReactElement {
  const { values } = props;
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const textColor = getContrastText(values, theme);

  return (
    <div className={styles.chart}>
      <TooltipProvider>
        {values.map((v, i) => (
          <Fragment key={getDisplayValueKey(v)}>
            <Bar value={v} textColor={textColor} data-testid={`bar-${i}`} />
            <BarGap from={v} to={values[i + 1]} textColor={textColor} data-testid={`gap-${i}`} />
          </Fragment>
        ))}
      </TooltipProvider>
    </div>
  );
}

export const PureChart = React.memo(Chart);

const getStyles = () => {
  return {
    chart: css({
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      alignItems: 'center',
    }),
  };
};
