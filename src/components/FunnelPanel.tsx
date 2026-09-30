import React, { type ReactElement, type ReactNode } from 'react';
import { css } from '@emotion/css';
import { Alert, useStyles2, useTheme2 } from '@grafana/ui';
import { GrafanaTheme2, type PanelProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Layout, type PanelOptions } from 'types';
import { type ComparisonError } from '../data/comparison';
import { useFunnelComparison } from '../data/useFunnelComparison';
import { FunnelDataResultStatus, useFunnelData } from '../data/useFunnelData';
import { PureChart } from './Chart';
import { PureLabels } from './Labels';
import { PurePercentages } from './Percentages';
import { PureFlowLayout } from './Flow';
import { Unsupported } from './Unsupported';
import { Nodata } from './Nodata';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height, data, options, fieldConfig, replaceVariables, timeZone } = props;
  const { layout, orientation, showRemainedPercentage, showPercentage, outcomeDirection } = options;

  const theme = useTheme2();
  const styles = useStyles2(getStyles(width, height));

  const { current, comparison, error } = useFunnelComparison(
    {
      fieldConfig,
      replaceVariables,
      theme,
      data: data.series,
      timeZone,
    },
    options
  );

  const { values, links, status } = useFunnelData(
    {
      fieldConfig,
      replaceVariables,
      theme,
      data: current,
      timeZone,
    },
    options
  );

  if (comparison) {
    return (
      <div className={styles.container}>
        <PureFlowLayout
          values={comparison.values}
          links={comparison.links}
          orientation={orientation}
          width={width}
          height={height}
          showRemainedPercentage={showRemainedPercentage}
          comparison={comparison}
          outcomeDirection={outcomeDirection}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.withWarning}>
          <Alert severity="warning" title={getComparisonErrorMessage(error)} />
          <div className={styles.content}>{renderContent()}</div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );

  function renderContent(): ReactNode {
    switch (status) {
      case FunnelDataResultStatus.nodata:
        return <Nodata />;
      case FunnelDataResultStatus.unsupported:
        return <Unsupported />;
      default:
        if (layout === Layout.flow) {
          return (
            <PureFlowLayout
              values={values}
              links={links}
              orientation={orientation}
              width={width}
              height={height}
              showRemainedPercentage={showRemainedPercentage}
            />
          );
        }

        return (
          <>
            <PureLabels values={values} />
            <PureChart values={values} showRemainedPercentage={showRemainedPercentage} />
            {showPercentage !== false && <PurePercentages values={values} />}
          </>
        );
    }
  }
}

function getComparisonErrorMessage(reason: ComparisonError): string {
  switch (reason) {
    case 'missing-period':
      return t('components.comparison.missing-period', 'Time comparison needs the results of the current period');
    case 'unmatched-steps':
      return t('components.comparison.unmatched-steps', 'Current and previous funnel steps do not match');
    default:
      return t('components.comparison.invalid-steps', 'Comparison needs one non-negative numeric value per step');
  }
}

const getStyles = (width: number, height: number) => (_: GrafanaTheme2) => {
  return {
    container: css({
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
    }),
    withWarning: css({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minWidth: 0,
    }),
    content: css({
      display: 'flex',
      flex: 1,
      minHeight: 0,
    }),
  };
};
