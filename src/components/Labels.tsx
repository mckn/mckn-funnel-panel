import React, { type ReactElement } from 'react';
import { type FunnelData } from 'data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

type Props = {
  data: FunnelData[];
};

export function Labels(props: Props): ReactElement {
  const { data } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.labels}>
      {data.map((d, i) => (
        <div key={d.label}>{d.label}</div>
      ))}
    </div>
  );
}

export const PureLabels = React.memo(Labels);

const getStyles = () => {
  return {
    labels: css({
      flexBasis: '150px',
      display: 'flex',
      flexDirection: 'column',
    }),
  };
};
