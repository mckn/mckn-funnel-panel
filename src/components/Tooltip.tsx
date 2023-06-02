import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import { useTheme2 } from '@grafana/ui';
import { Tooltip } from 'react-tooltip';

export function useTooltip(scope: string): [string, (props: PropsWithChildren) => ReactElement] {
  const theme = useTheme2();
  const { isDark } = theme;

  return useMemo(() => {
    const id = createTooltipId(`gfp-${scope}`);
    return [id, (props: PropsWithChildren) => <FunnelTooltip {...props} id={id} isDark={isDark} />];
  }, [isDark, scope]);
}

let sequence = 0;

function createTooltipId(prefix: string): string {
  sequence = sequence + 1;
  return `${prefix}-${sequence}`;
}

type Props = PropsWithChildren<{ id: string; isDark: boolean }>;

function FunnelTooltip(props: Props): ReactElement {
  const { id, isDark, children } = props;

  return (
    <Tooltip id={id} variant={isDark ? 'light' : 'dark'} noArrow={true} float={true}>
      {children}
    </Tooltip>
  );
}
