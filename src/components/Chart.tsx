import React, { type ReactElement, Fragment } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { BarGap } from './BarGap';
import { Bar } from './Bar';
import { TooltipProvider } from './Tooltip';
import { type DisplayValue } from '@grafana/data';
import { getDisplayValueKey } from '../utils';

export type ChartData = {
  backgroundColor?: string;
};

type Props = {
  values: DisplayValue[];
};

export function Chart(props: Props): ReactElement {
  const { values } = props;
  const styles = useStyles2(getStyles);

  const chart: ChartData = { backgroundColor: values.length > 0 ? values[0].color : undefined };

  return (
    <div className={styles.chart}>
      <TooltipProvider>
        {values.map((v, i) => (
          <Fragment key={getDisplayValueKey(v)}>
            <Bar value={v} chart={chart} data-testid={`bar-${i}`} />
            <BarGap from={v} to={values[i + 1]} chart={chart} data-testid={`gap-${i}`} />
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
