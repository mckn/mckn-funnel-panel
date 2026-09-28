import React, { type CSSProperties, type ReactElement, Fragment, useState } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { Orientation } from 'types';
import { getDisplayValueKey } from 'utils';
import { type LinksSupplier } from '../../data/useFunnelData';
import { TooltipProvider } from '../Tooltip';
import { StepInfo } from './StepInfo';
import { FunnelFlow } from './FunnelFlow';

const FUNNEL_WIDTH_RATIO = 0.45;
const MIN_FUNNEL_WIDTH = 120;
const COMPACT_STEP_HEIGHT = 90;

type Props = {
  values: DisplayValue[];
  links: LinksSupplier[];
  orientation: Orientation;
  width: number;
  height: number;
  showRemainedPercentage: boolean;
  'data-testid'?: string;
};

export function FlowLayout(props: Props): ReactElement {
  const { values, links, orientation, width, height, showRemainedPercentage } = props;
  const horizontal = orientation === Orientation.horizontal;
  const funnelWidth = Math.max(MIN_FUNNEL_WIDTH, Math.round(width * FUNNEL_WIDTH_RATIO));
  const compact = !horizontal && height / Math.max(values.length, 1) < COMPACT_STEP_HEIGHT;
  const styles = useStyles2(getStyles(values.length, funnelWidth, horizontal));
  const [highlightedIndex, setHighlightedIndex] = useState<number>();

  return (
    <TooltipProvider>
      <div className={styles.container} data-testid={props['data-testid']}>
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
              menuPlacement={horizontal ? 'corner' : 'title'}
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
    </TooltipProvider>
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
    }),
    divider: css({
      pointerEvents: 'none',
      [horizontal ? 'borderLeft' : 'borderTop']: `1px solid ${theme.colors.border.weak}`,
    }),
    funnel: css(horizontal ? { gridRow: 2, gridColumn: '1 / -1' } : { gridRow: '1 / -1', gridColumn: 2 }),
  };
};
