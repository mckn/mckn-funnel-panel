import { DrawInstruction } from '../types';
import { Bar } from './bar';
import { FunnelData } from './dataMapper';
import { Trapezoid } from './trapezoid';

type ConvertOptions = {
  canvasWidth: number;
  canvasHeight: number;
  data: FunnelData[];
  connectBars: boolean;
};

export function convertToInstructions(options: ConvertOptions): DrawInstruction[] {
  const { data, canvasHeight, canvasWidth, connectBars } = options;
  const numberOfBars = calculateNumberOfBars(data.length, connectBars);
  const barWidth = canvasWidth * 0.8;
  const barHeight = (canvasHeight * 0.8) / numberOfBars;
  const startY = (canvasHeight - canvasHeight * 0.8) / 2;
  const instructions: DrawInstruction[] = [];

  let previousBar: Bar | undefined;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const x = canvasWidth / 2 - (barWidth * point.percent) / 2;
    const y = startY + barHeight * (connectBars ? 1.5 : 1) * i;
    const w = barWidth * point.percent;
    const h = barHeight;
    const bar = new Bar({ x, y, w, h, color: point.color });

    if (previousBar && connectBars) {
      instructions.push(
        new Trapezoid({
          from: previousBar,
          to: bar,
          color: 'green',
        })
      );
    }

    instructions.push(bar);
    previousBar = bar;
  }

  return instructions;
}

function calculateNumberOfBars(numberOfValues: number, connectBars: boolean): number {
  if (!connectBars) {
    return numberOfValues;
  }
  return numberOfValues + (numberOfValues - 1) / 2;
}
