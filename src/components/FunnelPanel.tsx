import React, { type ReactElement } from 'react';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { GrafanaTheme2, type PanelProps } from '@grafana/data';
import { type PanelOptions } from 'types';
import { FunnelDataResultStatus, useFunnelData } from '../data/useFunnelData';
import { PureChart } from './Chart';
import { PureLabels } from './Labels';
import { PurePercentages } from './Percentages';
import { Unsupported } from './Unsupported';
import { Nodata } from './Nodata';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height, data, fieldConfig, replaceVariables, timeZone } = props;
  const theme = useTheme2();
  const styles = useStyles2(getStyles(width, height));

  const { values, status } = useFunnelData({
    fieldConfig,
    replaceVariables,
    theme,
    data: data.series,
    timeZone,
  });

  switch (status) {
    case FunnelDataResultStatus.nodata:
      return (
        <div className={styles.container}>
          <Nodata />
        </div>
      );
    case FunnelDataResultStatus.unsupported:
      return (
        <div className={styles.container}>
          <Unsupported />
        </div>
      );
    default:
      return (
        <div className={styles.container}>
          <PureLabels values={values} />
          <PureChart values={values} />
          <PurePercentages values={values} />
        </div>
      );
  }
}

const getStyles = (width: number, height: number) => (_: GrafanaTheme2) => {
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
