import { Field } from '@grafana/data';
import { PaintInstruction } from './types';

type ConvertOptions = {
  canvasWidth: number;
  canvasHeight: number;
  labelsField: Field<string>;
  valuesField: Field<number>;
};

export function convertToInstructions(options: ConvertOptions): PaintInstruction[] {
  const { valuesField, canvasHeight, canvasWidth } = options;
  const values = valuesField.values;
  const barWidth = canvasWidth * 0.8;
  const barHeight = (canvasHeight * 0.8) / values.length;
  const startY = (canvasHeight - canvasHeight * 0.8) / 2;
  const instructions: PaintInstruction[] = [];

  for (let i = 0; i < values.length; i++) {
    const value = values.get(i);
    const x = canvasWidth / 2 - (barWidth * value) / 2;
    const y = startY + barHeight * i;
    const w = barWidth * value;
    const h = barHeight;

    instructions.push({ type: 'fillRect', x, y, w, h });
  }

  return instructions;
}
