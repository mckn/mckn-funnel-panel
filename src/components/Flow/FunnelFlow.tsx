import React, { type ReactElement, useId } from 'react';
import { css, cx } from '@emotion/css';
import { measureText, useStyles2, useTheme2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2 } from '@grafana/data';
import { Orientation } from 'types';
import { formatPercentage, getBandLabelPlacement, getDisplayValueKey, getFlowSegmentPath, useElementSize } from 'utils';
import { BarTooltip, useTooltipProps } from '../Tooltip';

// Width of the soft halo drawn around the band.
const HALO_SIZE = 6;
// The halo needs more opacity on dark backgrounds to read as a glow instead of a shadow.
const HALO_OPACITY_DARK = 0.4;
const HALO_OPACITY_LIGHT = 0.25;
const HALO_BLUR = 2;
const MIN_THICKNESS = 2;
// Opacity of the other steps while one step is highlighted.
const DIMMED_OPACITY = 0.35;
const LABEL_PADDING = 6;

type Props = {
  values: DisplayValue[];
  orientation: Orientation;
  highlightedIndex?: number;
  onHighlight: (index?: number) => void;
  className?: string;
};

export function FunnelFlow(props: Props): ReactElement {
  const { values, orientation, highlightedIndex, onHighlight, className } = props;
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const filterId = `funnel-halo-${useId().replace(/:/g, '')}`;

  const horizontal = orientation === Orientation.horizontal;
  const flowSize = horizontal ? width : height;
  const crossSize = horizontal ? height : width;
  const stepSize = flowSize / Math.max(values.length, 1);
  const maxThickness = Math.max(crossSize - HALO_SIZE * 2, 0);
  const getThickness = (value?: DisplayValue) => Math.max((value?.percent ?? 0) * maxThickness, MIN_THICKNESS);
  const { fontSize, fontWeightMedium } = theme.typography;
  const textHeight = fontSize * theme.typography.body.lineHeight;

  const segments = values.map((value, i) => {
    const thickness = getThickness(value);
    const label = formatPercentage(value.percent ?? 0);

    return {
      key: getDisplayValueKey(value),
      value,
      label,
      dimmed: highlightedIndex !== undefined && highlightedIndex !== i,
      paths: getFlowSegmentPath({
        orientation,
        start: i * stepSize,
        end: (i + 1) * stepSize,
        crossSize,
        fromThickness: thickness,
        toThickness: getThickness(values[i + 1] ?? value),
      }),
      labelPlacement: getBandLabelPlacement({
        orientation,
        start: i * stepSize,
        crossSize,
        thickness,
        haloSize: HALO_SIZE,
        textWidth: measureText(label, fontSize, fontWeightMedium).width,
        textHeight,
        padding: LABEL_PADDING,
      }),
    };
  });

  return (
    <div ref={ref} className={cx(styles.container, className)}>
      {/* Absolutely positioned so the measured size never feeds back into the grid layout. */}
      <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={HALO_BLUR} />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {segments.map(({ key, value, paths, dimmed }) => (
            <path
              key={key}
              className={styles.dimmable}
              d={paths.edges}
              fill="none"
              stroke={value.color}
              strokeOpacity={theme.isDark ? HALO_OPACITY_DARK : HALO_OPACITY_LIGHT}
              strokeWidth={HALO_SIZE * 2}
              strokeLinejoin="round"
              opacity={dimmed ? DIMMED_OPACITY : 1}
            />
          ))}
        </g>
        <g>
          {segments.map(({ key, value, paths, dimmed }, i) => (
            <FlowSegment
              key={key}
              value={value}
              path={paths.area}
              dimmed={dimmed}
              onMouseEnter={() => onHighlight(i)}
              onMouseLeave={() => onHighlight(undefined)}
              data-testid={`bar-${i}`}
            />
          ))}
        </g>
      </svg>
      {segments.map(({ key, value, label, labelPlacement, dimmed }, i) => (
        <div
          key={key}
          className={cx(styles.label, styles.dimmable)}
          style={{
            left: labelPlacement.x,
            top: labelPlacement.y,
            opacity: dimmed ? DIMMED_OPACITY : 1,
            color: labelPlacement.inside ? getContrastText(theme, value.color) : undefined,
          }}
          data-testid={`percentage-${i}`}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function getContrastText(theme: GrafanaTheme2, color?: string): string {
  return theme.colors.getContrastText(color ?? theme.colors.background.primary, theme.colors.contrastThreshold);
}

type FlowSegmentProps = {
  value: DisplayValue;
  path: string;
  dimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  'data-testid'?: string;
};

function FlowSegment(props: FlowSegmentProps): ReactElement {
  const { value, path, dimmed, onMouseEnter, onMouseLeave } = props;
  const { color, title = '', percent = 0, numeric } = value;
  const styles = useStyles2(getStyles);
  const tooltipProps = useTooltipProps({
    content: <BarTooltip label={title} value={numeric} percentage={percent} />,
  });

  return (
    <path
      {...tooltipProps}
      className={styles.dimmable}
      d={path}
      fill={color}
      opacity={dimmed ? DIMMED_OPACITY : 1}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={props['data-testid']}
    />
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css({
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
    }),
    svg: css({
      position: 'absolute',
      inset: 0,
      overflow: 'visible',
    }),
    label: css({
      position: 'absolute',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeightMedium,
      lineHeight: theme.typography.body.lineHeight,
    }),
    dimmable: css({
      transition: 'opacity 150ms ease-in-out',
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    }),
  };
};
