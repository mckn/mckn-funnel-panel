import { HorizontalGroup } from '@grafana/ui';
import React, { ReactElement } from 'react';

export function Unsupported(): ReactElement {
  return (
    <HorizontalGroup justify="center">
      <span>unsupported</span>
    </HorizontalGroup>
  );
}

export const PureUnsupported = React.memo(Unsupported);
