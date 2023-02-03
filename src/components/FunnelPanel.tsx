import React, { type ReactElement, createRef, useEffect } from 'react';
import { FieldType, toDataFrame, type PanelProps } from '@grafana/data';
import { type PanelOptions } from 'types';
import { usePainter, useInstructions } from '../painter';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height } = props;
  const canvasRef = createRef<HTMLCanvasElement>();
  const painter = usePainter(canvasRef);

  const data = toDataFrame({
    name: 'funnel data',
    fields: [
      {
        name: 'lable',
        type: FieldType.string,
        values: ['Sent', 'Viewed', 'Clicked', 'Add to cart', 'Purchased'],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [1, 0.6822, 0.2939, 0.1075, 0.0995],
      },
    ],
  });

  const { instructions } = useInstructions({ width, height, data });
  useEffect(() => painter(instructions), [painter, instructions]);

  return <canvas width={width} height={height} ref={canvasRef} />;
}
