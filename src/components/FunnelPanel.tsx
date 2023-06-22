import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { GrafanaTheme2, type PanelProps } from '@grafana/data';
import { type PanelOptions } from 'types';
import { useFunnelData } from '../data/useFunnelData';
import { PureChart } from './Chart';
import { PureLabels } from './Labels';
import { PurePercentages } from './Percentages';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height, data } = props;
  const { data: funnelData, status } = useFunnelData(data.series);
  const styles = useStyles2(getStyles(width, height));

  switch (status) {
    case 'unsupported':
      <div className={styles.container}>unsupported</div>;
    case 'error':
      <div className={styles.container}>error</div>;

    default:
      return (
        <div className={styles.container}>
          <PureLabels data={funnelData} />
          <PureChart data={funnelData} />
          <PurePercentages data={funnelData} />
        </div>
      );
  }
}

const getStyles = (width: number, height: number) => (theme: GrafanaTheme2) => {
  return {
    container: css({
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
    }),
    left: css({
      flexBasis: '150px',
      backgroundColor: 'blue',
    }),
    right: css({
      flexBasis: '150px',
      backgroundColor: 'white',
    }),
  };
};
