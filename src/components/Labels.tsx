import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { type DisplayValue } from '@grafana/data';
import { getDisplayValueKey } from 'utils';

type Props = {
  values: DisplayValue[];
};

export function Labels(props: Props): ReactElement {
  const { values } = props;
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      {values.map((v, i) => (
        <div className={styles.label} key={getDisplayValueKey(v)} data-testid={`label-${i}`}>
          {v.title}
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
      textAlign: 'right',
    }),
  };
};
