import React, { type ReactElement, type ReactNode, useMemo } from 'react';
import { css } from '@emotion/css';
import { Alert, useStyles2, useTheme2 } from '@grafana/ui';
import { GrafanaTheme2, type PanelProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import { ComparisonPeriod, Layout, OutcomeDirection, type PanelOptions } from 'types';
import { buildComparison, type ComparisonError, selectComparisonFrames } from '../data/comparison';
import { getComparisonPeriodLabels } from '../data/periodLabels';
import { FunnelDataResultStatus, useFunnelData } from '../data/useFunnelData';
import { PureChart } from './Chart';
import { PureLabels } from './Labels';
import { PurePercentages } from './Percentages';
import { type FlowComparison, PureFlowLayout } from './Flow';
import { Unsupported } from './Unsupported';
import { Nodata } from './Nodata';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height, data, options, fieldConfig, replaceVariables, timeZone, timeRange } = props;
  const { layout, orientation, showRemainedPercentage, showPercentage } = options;
  const { sorting, comparisonPeriod, outcomeDirection, currentRefId, previousRefId } = options;

  const theme = useTheme2();
  const styles = useStyles2(getStyles(width, height));
  const selection = useMemo(() => selectComparisonFrames(data.series, options), [data.series, options]);

  const { values, links, status } = useFunnelData(
    {
      fieldConfig,
      replaceVariables,
      theme,
      data: selection.current,
      timeZone,
    },
    options
  );

  const comparison = useMemo(() => {
    if (selection.kind !== 'compare') {
      return undefined;
    }
    return buildComparison(
      selection,
      { fieldConfig, replaceVariables, theme, timeZone },
      { sorting, comparisonPeriod }
    );
  }, [selection, fieldConfig, replaceVariables, theme, timeZone, sorting, comparisonPeriod]);

  const flowComparison = useMemo((): FlowComparison | undefined => {
    if (selection.kind !== 'compare' || comparison?.kind !== 'ready') {
      return undefined;
    }
    const { newest, oldest } = getComparisonPeriodLabels(selection, timeRange, timeZone, {
      currentRefId,
      previousRefId,
    });
    const showOldest = comparisonPeriod === ComparisonPeriod.oldest;

    return {
      steps: comparison.steps,
      overall: comparison.overall,
      labels: showOldest ? { selected: oldest, compared: newest } : { selected: newest, compared: oldest },
      outcomeDirection: outcomeDirection ?? OutcomeDirection.higher,
    };
  }, [selection, comparison, timeRange, timeZone, currentRefId, previousRefId, comparisonPeriod, outcomeDirection]);

  if (comparison?.kind === 'ready' && flowComparison) {
    return (
      <div className={styles.container}>
        <PureFlowLayout
          values={comparison.values}
          links={comparison.links}
          orientation={orientation}
          width={width}
          height={height}
          showRemainedPercentage={showRemainedPercentage}
          comparison={flowComparison}
        />
      </div>
    );
  }

  const error = selection.kind === 'error' ? selection.reason : comparison?.kind === 'error' ? comparison.reason : null;

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
      return t('components.comparison.missing-period', 'Comparison needs both current and previous query results');
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
