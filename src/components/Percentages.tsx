import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { formatPercentage, getDisplayValueKey } from '../utils';
import { type DisplayValue } from '@grafana/data';

type Props = {
  values: DisplayValue[];
};

export function Percentages(props: Props): ReactElement {
  const { values } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      {values.map((v) => (
        <div className={styles.percentage} key={getDisplayValueKey(v)}>
          {formatPercentage(v.percent ?? 0)}
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
