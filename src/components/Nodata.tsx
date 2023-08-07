import { css } from '@emotion/css';
import { type GrafanaTheme2 } from '@grafana/data';
import { HorizontalGroup, useStyles2 } from '@grafana/ui';
import React, { type ReactElement } from 'react';

export function Nodata(): ReactElement {
  const styles = useStyles2(getStyles);

  return (
    <HorizontalGroup justify="center" align="center">
      <p className={styles.text}>No data</p>
    </HorizontalGroup>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    text: css({
      color: theme.colors.text.secondary,
      fontSize: '18px',
      margin: 0,
    }),
  };
};
