import React, { type CSSProperties, type ReactElement, useState } from 'react';
import { css, cx } from '@emotion/css';
import tinycolor from 'tinycolor2';
import { t } from '@grafana/i18n';
import { FormattedValueDisplay, Icon, type IconName, useStyles2 } from '@grafana/ui';
import { type DisplayValue, type GrafanaTheme2, type LinkModel } from '@grafana/data';
import { formatPercentage, getDropRate, getTrendIconName } from 'utils';
import { StepLinksMenu } from './StepLinksMenu';

type Props = {
  value: DisplayValue;
  previous?: DisplayValue;
  index: number;
  compact: boolean;
  // Aligns the details to the top of the step instead of centering them.
  alignTop: boolean;
  highlighted: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showRemainedPercentage: boolean;
  getLinks?: () => LinkModel[];
  style?: CSSProperties;
  'data-testid'?: string;
};

export function StepInfo(props: Props): ReactElement {
  const { value, previous, index, compact, alignTop, highlighted, onMouseEnter, onMouseLeave } = props;
  const { showRemainedPercentage, getLinks, style } = props;
  const styles = useStyles2(getStyles(compact, alignTop));
  const highlightStyle = highlighted ? { backgroundColor: getHighlightColor(value.color) } : undefined;
  const [menuOpen, setMenuOpen] = useState(false);

  const menu = getLinks && (
    <div className={cx(styles.menu, (highlighted || menuOpen) && styles.menuVisible)}>
      <StepLinksMenu
        getLinks={getLinks}
        title={value.title ?? ''}
        onVisibleChange={setMenuOpen}
        data-testid={`menu-${index}`}
      />
    </div>
  );

  return (
    <div
      className={cx(styles.step, getLinks && styles.withLinks)}
      style={{ ...style, ...highlightStyle }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid={props['data-testid']}
    >
      <div className={styles.header}>
        <div className={styles.title} data-testid={`label-${index}`}>
          {value.title}
        </div>
        {!compact && menu}
      </div>
      <div className={styles.value} data-testid={`value-${index}`}>
        <FormattedValueDisplay value={value} />
      </div>
      <div className={styles.metrics}>
        {previous && (
          <Conversion
            from={previous}
            to={value}
            compact={compact}
            showRemainedPercentage={showRemainedPercentage}
            data-testid={`conversion-${index}`}
          />
        )}
      </div>
      {compact && menu}
    </div>
  );
}

function getHighlightColor(color?: string): string {
  return tinycolor(color).setAlpha(0.15).toRgbString();
}

type ConversionProps = {
  from: DisplayValue;
  to: DisplayValue;
  compact: boolean;
  showRemainedPercentage: boolean;
  'data-testid'?: string;
};

function Conversion(props: ConversionProps): ReactElement {
  const { from, to, compact, showRemainedPercentage } = props;
  const fromPercent = from.percent ?? 0;
  const toPercent = to.percent ?? 0;
  const drop = getDropRate(fromPercent, toPercent);

  return (
    <Metric
      icon={getTrendIconName(fromPercent, toPercent)}
      value={formatPercentage(showRemainedPercentage ? 1 - drop : drop)}
      caption={
        showRemainedPercentage ? t('components.flow.retention', 'retention') : t('components.flow.drop-off', 'drop-off')
      }
      compact={compact}
      data-testid={props['data-testid']}
    />
  );
}

type MetricProps = {
  value: string;
  caption: string;
  compact: boolean;
  icon?: IconName;
  'data-testid'?: string;
};

function Metric(props: MetricProps): ReactElement {
  const { value, caption, compact, icon, ...rest } = props;
  const styles = useStyles2(getMetricStyles);

  return (
    <div className={cx(styles.metric, compact && styles.compact)} {...rest}>
      <span className={styles.value}>
        {icon && <Icon name={icon} />}
        {value}
      </span>
      <span className={styles.caption}>{caption}</span>
    </div>
  );
}

const menuClassName = 'step-links-menu';

// Horizontal step padding, also used as the gap between the links menu and the right edge.
const STEP_PADDING_X = 2;
// Right padding for steps with links: edge gap + 24px button + 8px gap to the content.
const MENU_PADDING = STEP_PADDING_X + 4;

const getStyles = (compact: boolean, alignTop: boolean) => (theme: GrafanaTheme2) => {
  return {
    step: css({
      position: 'relative',
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      alignItems: compact ? 'center' : 'flex-start',
      justifyContent: compact || alignTop ? 'flex-start' : 'center',
      gap: compact ? theme.spacing(2) : theme.spacing(0.5),
      minWidth: 0,
      minHeight: 0,
      overflow: 'hidden',
      padding: theme.spacing(compact ? 0 : 1, STEP_PADDING_X),
      transition: 'background-color 150ms ease-in-out',
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
      // Same show-on-hover behavior as the Grafana panel menu. Opacity only, so the button stays reachable with Tab.
      [`&:hover .${menuClassName}, &:focus-within .${menuClassName}`]: {
        opacity: 1,
      },
    }),
    withLinks: css({
      paddingRight: theme.spacing(MENU_PADDING),
    }),
    // Holds the title and, when not compact, the links menu aligned to the top of the title.
    header: css(compact ? { minWidth: 0 } : { position: 'relative', alignSelf: 'stretch', minWidth: 0 }),
    menu: cx(
      menuClassName,
      css({
        position: 'absolute',
        ...(compact
          ? { right: theme.spacing(STEP_PADDING_X), top: '50%', transform: 'translateY(-50%)' }
          : // The header ends at the step padding, move the menu out into the padding to reach the corner.
            { right: `calc(${theme.spacing(STEP_PADDING_X)} - ${theme.spacing(MENU_PADDING)})`, top: 0 }),
        opacity: 0,
        transition: 'opacity 150ms ease-in-out',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      })
    ),
    menuVisible: css({
      opacity: 1,
    }),
    title: css({
      minWidth: 0,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }),
    value: css({
      whiteSpace: 'nowrap',
      fontSize: compact ? theme.typography.h5.fontSize : theme.typography.h3.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      lineHeight: compact ? theme.typography.h5.lineHeight : theme.typography.h3.lineHeight,
    }),
    metrics: css({
      display: 'flex',
      flexWrap: compact ? 'nowrap' : 'wrap',
      columnGap: theme.spacing(compact ? 2 : 3),
      rowGap: theme.spacing(0.5),
      whiteSpace: 'nowrap',
    }),
  };
};

const getMetricStyles = (theme: GrafanaTheme2) => {
  return {
    metric: css({
      display: 'flex',
      flexDirection: 'column',
    }),
    compact: css({
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing(0.5),
    }),
    value: css({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(0.25),
      fontWeight: theme.typography.fontWeightMedium,
    }),
    caption: css({
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
    }),
  };
};
