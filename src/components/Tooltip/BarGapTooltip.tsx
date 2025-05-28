import React, { type ReactElement } from 'react';
import { formatPercentage } from '../../utils';

type Props = {
  drop: number;
  fromLabel: string;
  toLabel?: string;
  showRemainedPercentage: boolean;
};

export function BarGapTooltip(props: Props): ReactElement {
  const { drop, fromLabel, toLabel, showRemainedPercentage } = props;

  return (
    <div>
      <div>
        {(showRemainedPercentage ?? true)
          ? `${formatPercentage(1 - drop)} retained from "${fromLabel}" to "${toLabel}"`
          : `${formatPercentage(drop)} drop from "${fromLabel}" to "${toLabel}"`
        }
      </div>
    </div>
  );
}
