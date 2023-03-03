import { Field } from '@grafana/data';
import { DrawInstruction } from '../types';

type ConvertOptions = {
  canvasWidth: number;
  canvasHeight: number;
  labelsField: Field<string>;
  valuesField: Field<number>;
  connectBars: boolean;
};

type BarInfo = {
  topLeft: {
    x: number;
    y: number;
  };
  topRight: {
    x: number;
    y: number;
  };
  bottomLeft: {
    x: number;
    y: number;
  };
  bottomRight: {
    x: number;
    y: number;
  };
};

export function convertToInstructions(options: ConvertOptions): DrawInstruction[] {
  const { valuesField, canvasHeight, canvasWidth, connectBars } = options;
  const values = valuesField.values;
  const numberOfBars = calculateNumberOfBars(values.length, connectBars);
  const barWidth = canvasWidth * 0.8;
  const barHeight = (canvasHeight * 0.8) / numberOfBars;
  const startY = (canvasHeight - canvasHeight * 0.8) / 2;
  const instructions: DrawInstruction[] = [];

  let previousBar: BarInfo | undefined;

  for (let i = 0; i < values.length; i++) {
    const value = values.get(i);
    const x = canvasWidth / 2 - (barWidth * value) / 2;
    const y = startY + barHeight * (connectBars ? 2 : 1) * i;
    const w = barWidth * value;
    const h = barHeight;
    const bar = calculateBarInfo(x, y, w, h);

    if (previousBar) {
      instructions.push(drawTrapezoid(previousBar, bar));
    }

    instructions.push(drawRect(x, y, w, h));
    previousBar = bar;
  }

  return instructions;
}

function drawRect(x: number, y: number, w: number, h: number): DrawInstruction {
  return (ctx) => ctx.fillRect(x, y, w, h);
}

function drawTrapezoid(previous: BarInfo, current: BarInfo): DrawInstruction {
  const topLeft = previous.bottomLeft;
  const topRight = previous.bottomRight;
  const bottomLeft = current.topLeft;
  const bottomRight = current.topRight;

  return (ctx) => {
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.fill();
  };
}

function calculateNumberOfBars(numberOfValues: number, connectBars: boolean): number {
  if (!connectBars) {
    return numberOfValues;
  }
  return numberOfValues + (numberOfValues - 1);
}

function calculateBarInfo(x: number, y: number, w: number, h: number): BarInfo {
  return {
    topLeft: {
      x: x,
      y: y,
    },
    topRight: {
      x: x + w,
      y: y,
    },
    bottomLeft: {
      x: x,
      y: y + h,
    },
    bottomRight: {
      x: x + w,
      y: y + h,
    },
  };
}
