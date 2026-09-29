import React, { type CSSProperties, type ReactElement, Fragment, useState } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { Orientation, OutcomeDirection } from 'types';
import { getDisplayValueKey } from 'utils';
import { type RateComparison, type StepComparison } from '../../data/comparison';
import { type LinksSupplier } from '../../data/useFunnelData';
import { COMPARISON_HEADER_HEIGHT, ComparisonHeader } from './ComparisonHeader';
import { StepInfo } from './StepInfo';
import { FunnelFlow } from './FunnelFlow';

const FUNNEL_WIDTH_RATIO = 0.45;
const MIN_FUNNEL_WIDTH = 120;
const COMPACT_STEP_HEIGHT = 90;

export type FlowComparison = {
  // Same index as the values.
  steps: StepComparison[];
  overall: RateComparison;
};

type Props = {
  values: DisplayValue[];
  links: LinksSupplier[];
  orientation: Orientation;
  width: number;
  height: number;
  showRemainedPercentage: boolean;
  // Change from the other period when comparing two periods.
  comparison?: FlowComparison;
  outcomeDirection?: OutcomeDirection;
  'data-testid'?: string;
};

export function FlowLayout(props: Props): ReactElement {
  const { values, links, orientation, width, height, showRemainedPercentage, comparison } = props;
  const { outcomeDirection = OutcomeDirection.higher } = props;
  const horizontal = orientation === Orientation.horizontal;
  const funnelWidth = Math.max(MIN_FUNNEL_WIDTH, Math.round(width * FUNNEL_WIDTH_RATIO));
  const stepsHeight = comparison ? height - COMPARISON_HEADER_HEIGHT : height;
  const compact = !horizontal && stepsHeight / Math.max(values.length, 1) < COMPACT_STEP_HEIGHT;
  const styles = useStyles2(getStyles(values.length, funnelWidth, horizontal));
  const [highlightedIndex, setHighlightedIndex] = useState<number>();

  const steps = (
    <div className={styles.container} data-testid={comparison ? undefined : props['data-testid']}>
      {values.map((v, i) => (
        <Fragment key={getDisplayValueKey(v)}>
          <div className={styles.divider} style={getDividerPlacement(i, horizontal)} />
          <StepInfo
            value={v}
            previous={values[i - 1]}
            index={i}
            compact={compact}
            alignTop={horizontal}
            highlighted={highlightedIndex === i}
            onMouseEnter={() => setHighlightedIndex(i)}
            onMouseLeave={() => setHighlightedIndex(undefined)}
            showRemainedPercentage={showRemainedPercentage}
            getLinks={links[i]}
            comparison={comparison?.steps[i]}
            outcomeDirection={outcomeDirection}
            style={getStepPlacement(i, horizontal)}
            data-testid={`step-${i}`}
          />
        </Fragment>
      ))}
      <FunnelFlow
        values={values}
        orientation={orientation}
        highlightedIndex={highlightedIndex}
        onHighlight={setHighlightedIndex}
        className={styles.funnel}
      />
    </div>
  );

  if (!comparison) {
    return steps;
  }

  return (
    <div className={styles.comparison} data-testid={props['data-testid']}>
      <ComparisonHeader
        overall={comparison.overall}
        outcomeDirection={outcomeDirection}
        data-testid="comparison-header"
      />
      {steps}
    </div>
  );
}

export const PureFlowLayout = React.memo(FlowLayout);

function getStepPlacement(index: number, horizontal: boolean): CSSProperties {
  return horizontal ? { gridRow: 1, gridColumn: index + 1 } : { gridRow: index + 1, gridColumn: 1 };
}

function getDividerPlacement(index: number, horizontal: boolean): CSSProperties {
  if (index === 0) {
    return { display: 'none' };
  }
  return horizontal ? { gridRow: '1 / -1', gridColumn: index + 1 } : { gridRow: index + 1, gridColumn: '1 / -1' };
}

const getStyles = (steps: number, funnelWidth: number, horizontal: boolean) => (theme: GrafanaTheme2) => {
  return {
    container: css({
      display: 'grid',
      gridTemplateColumns: horizontal ? `repeat(${steps}, minmax(0, 1fr))` : `minmax(0, 1fr) ${funnelWidth}px`,
      gridTemplateRows: horizontal ? 'auto minmax(0, 1fr)' : `repeat(${steps}, minmax(0, 1fr))`,
      width: '100%',
      height: '100%',
      minHeight: 0,
    }),
    // Header above the steps.
    comparison: css({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    }),
    divider: css({
      pointerEvents: 'none',
      [horizontal ? 'borderLeft' : 'borderTop']: `1px solid ${theme.colors.border.weak}`,
    }),
    funnel: css(horizontal ? { gridRow: 2, gridColumn: '1 / -1' } : { gridRow: '1 / -1', gridColumn: 2 }),
  };
};
