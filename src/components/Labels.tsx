import React, { type ReactElement } from 'react';
import { type FunnelData } from '../data/useFunnelData';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

type Props = {
  data: FunnelData[];
};

export function Labels(props: Props): ReactElement {
  const { data } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      {data.map((d, i) => (
        <div className={styles.label} key={d.label}>
          {d.label}
        </div>
      ))}
    </div>
  );
}

export const PureLabels = React.memo(Labels);

const getStyles = () => {
  return {
    container: css({
      flexBasis: '120px',
      display: 'flex',
      flexDirection: 'column',
      paddingRight: '10px',
    }),
    label: css({
      flexGrow: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
    }),
  };
};
