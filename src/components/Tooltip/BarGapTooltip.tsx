import { t } from '@grafana/i18n';
import React, { type ReactElement } from 'react';
import { formatPercentage } from '../../utils';

type Props = {
  drop: number;
  fromLabel: string;
  toLabel?: string;
  showRemainedPercentage: boolean;
};

function getRetainedMessage(drop: number, fromLabel: string, toLabel?: string): string {
  return t('components.bar-gap-tooltip.retained', '{{percentage}} retained from "{{fromLabel}}" to "{{toLabel}}"', {
    percentage: formatPercentage(1 - drop),
    fromLabel,
    toLabel,
  });
}

function getDropMessage(drop: number, fromLabel: string, toLabel?: string): string {
  return t('components.bar-gap-tooltip.drop', '{{percentage}} drop from "{{fromLabel}}" to "{{toLabel}}"', {
    percentage: formatPercentage(drop),
    fromLabel,
    toLabel,
  });
}

export function BarGapTooltip(props: Props): ReactElement {
  const { drop, fromLabel, toLabel, showRemainedPercentage } = props;

  if (showRemainedPercentage) {
    return (
      <div>
        <div>{getRetainedMessage(drop, fromLabel, toLabel)}</div>
      </div>
    );
  }

  return (
    <div>
      <div>{getDropMessage(drop, fromLabel, toLabel)}</div>
    </div>
  );
}
