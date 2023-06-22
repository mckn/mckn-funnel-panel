import React, { type ReactElement } from 'react';
import { type FunnelData } from '../data/useFunnelData';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { formatPercentage } from '../utils';

type Props = {
  data: FunnelData[];
};

export function Percentages(props: Props): ReactElement {
  const { data } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      {data.map((d, i) => (
        <div className={styles.percentage} key={d.percentage}>
          {formatPercentage(d.percentage)}
        </div>
      ))}
    </div>
  );
}

export const PurePercentages = React.memo(Percentages);

const getStyles = () => {
  return {
    container: css({
      flexBasis: '120px',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '10px',
    }),
    percentage: css({
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'start',
    }),
  };
};
