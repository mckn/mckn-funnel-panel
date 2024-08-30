import { css } from '@emotion/css';
import { Alert, useStyles2 } from '@grafana/ui';
import React, { type ReactElement } from 'react';
import { Center } from './Center';

export function Unsupported(): ReactElement {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.container}>
      <Center>
        <Alert severity="info" title="Unsupported data">
          The data you have provided is not supported by this panel. Every data frame provided to the panel needs to
          contain at least one numeric field which will be used to visualize each step in the funnel.
        </Alert>
      </Center>
    </div>
  );
}

const getStyles = () => {
  return {
    container: css({
      padding: '10%',
    }),
  };
};
