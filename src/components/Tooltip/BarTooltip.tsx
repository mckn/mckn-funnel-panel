import { formatPercentage } from '../../utils';
import React, { ReactElement } from 'react';

type Props = {
  percentage: number;
  value: number;
  label: string;
};

export function BarTooltip(props: Props): ReactElement {
  const { percentage, value, label } = props;
  return (
    <div>
      <div>{label}</div>
      <div>
        {value} / {formatPercentage(percentage)}
      </div>
    </div>
  );
}
