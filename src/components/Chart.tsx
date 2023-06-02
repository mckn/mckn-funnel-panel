import React, { type ReactElement, Fragment } from 'react';
import { type FunnelData } from 'data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { BarGap } from './BarGap';
import { Bar } from './Bar';
import { TooltipProvider } from './Tooltip';

type Props = {
  data: FunnelData[];
};

export function Chart(props: Props): ReactElement {
  const { data } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.chart}>
      <TooltipProvider>
        {data.map((d, i) => (
          <Fragment key={`${d.label}-${d.percentage}`}>
            <Bar value={d.value} percentage={d.percentage} color={d.color} />
            <BarGap from={d} to={data[i + 1]} />
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
