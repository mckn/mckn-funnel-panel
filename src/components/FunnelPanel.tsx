import React, { type ReactElement, createRef, useEffect } from 'react';
import { type PanelProps } from '@grafana/data';
import { type PanelOptions } from 'types';
import { useCanvasDrawer, useInstructions } from '../canvas';

export function FunnelPanel(props: PanelProps<PanelOptions>): ReactElement {
  const { width, height, data } = props;
  const canvasRef = createRef<HTMLCanvasElement>();
  const painter = useCanvasDrawer(canvasRef);
  const { instructions } = useInstructions({ width, height, data: data.series });
  useEffect(() => painter(instructions), [painter, instructions]);

  return <canvas width={width} height={height} ref={canvasRef} />;
}
