import React, { PropsWithChildren } from 'react';
import { Stack, HorizontalGroup } from '@grafana/ui';

// This component is used to keep backwards compatability
// for older Grafana versions that doesn't have the Stack
// component.
export function Center({ children }: PropsWithChildren) {
  if (typeof Stack !== 'undefined') {
    return (
      <Stack justifyContent="center" alignItems="center">
        {children}
      </Stack>
    );
  }

  return (
    // eslint-disable-next-line deprecation/deprecation
    <HorizontalGroup justify="center" align="center">
      {children}
    </HorizontalGroup>
  );
}
