import React, { type ReactElement } from 'react';
import { type FunnelData } from 'data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

type Props = {
  data: FunnelData[];
};

export function Percentages(props: Props): ReactElement {
  const { data } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.percentages}>
      {data.map((d, i) => (
        <div key={d.percent}>{d.percent * 100}%</div>
      ))}
    </div>
  );
}

export const PurePercentages = React.memo(Percentages);

const getStyles = () => {
  return {
    percentages: css({
      flexBasis: '150px',
      display: 'flex',
      flexDirection: 'column',
    }),
  };
};
