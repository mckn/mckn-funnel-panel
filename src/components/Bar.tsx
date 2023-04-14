import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { type GrafanaTheme2 } from '@grafana/data';

type Props = {
  percent: number;
  label: string;
  color: string;
};

export function Bar(props: Props): ReactElement {
  const { percent, label, color } = props;
  const styles = useStyles2(getStyles(color));

  return (
    <div className={styles.bar} style={{ width: `${percent * 100}%` }}>
      <p className={styles.text}>{label}</p>
    </div>
  );
}

const getStyles = (color: string) => (theme: GrafanaTheme2) => {
  return {
    bar: css({
      flexGrow: 2,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    text: css({
      margin: 0,
      color: theme.colors.text.maxContrast,
      paddingLeft: '5px',
      paddingRight: '5px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    }),
  };
};
