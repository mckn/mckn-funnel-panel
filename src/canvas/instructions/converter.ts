import { DrawInstruction } from '../types';
import { FunnelData } from './dataMapper';

type ConvertOptions = {
  canvasWidth: number;
  canvasHeight: number;
  data: FunnelData[];
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
  const { data, canvasHeight, canvasWidth, connectBars } = options;
  const numberOfBars = calculateNumberOfBars(data.length, connectBars);
  const barWidth = canvasWidth * 0.8;
  const barHeight = (canvasHeight * 0.8) / numberOfBars;
  const startY = (canvasHeight - canvasHeight * 0.8) / 2;
  const instructions: DrawInstruction[] = [];

  let previousBar: BarInfo | undefined;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const x = canvasWidth / 2 - (barWidth * point.percent) / 2;
    const y = startY + barHeight * (connectBars ? 1.5 : 1) * i;
    const w = barWidth * point.percent;
    const h = barHeight;
    const bar = calculateBarInfo(x, y, w, h);

    if (previousBar) {
      instructions.push(drawTrapezoid(previousBar, bar));
    }

    instructions.push(drawRect(point.color, x, y, w, h));
    previousBar = bar;
  }

  return instructions;
}

function drawRect(color: string, x: number, y: number, w: number, h: number): DrawInstruction {
  return (ctx) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'black';
  };
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
  return numberOfValues + (numberOfValues - 1) / 2;
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
