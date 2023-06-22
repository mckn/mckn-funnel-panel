import React, { ReactElement } from 'react';
import { formatPercentage } from '../../utils';

type Props = {
  drop: number;
  fromLabel: string;
  toLabel?: string;
};

export function BarGapTooltip(props: Props): ReactElement {
  const { drop, fromLabel, toLabel } = props;

  return (
    <div>
      <div>
        {formatPercentage(drop)} drop from &quot;{fromLabel}&quot; to &quot;{toLabel}&quot;
      </div>
    </div>
  );
}
