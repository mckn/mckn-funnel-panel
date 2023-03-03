import { FieldType, toDataFrame } from '@grafana/data';
import { DrawInstruction } from 'canvas/types';
import { convertToInstructions } from './converter';

describe('convertToInstructions', () => {
  const data = toDataFrame({
    fields: [
      {
        name: 'lable',
        type: FieldType.string,
        values: ['Sent', 'Viewed', 'Clicked'],
      },
      {
        name: 'value',
        type: FieldType.number,
        values: [1, 0.8, 0.3],
      },
    ],
  });

  it('should place bar in the center with a width 80% of the panel', () => {
    const [drawFirst] = convertToInstructions({
      canvasWidth: 500,
      canvasHeight: 300,
      labelsField: data.fields[0],
      valuesField: data.fields[1],
      connectBars: false,
    });

    const ctx = applyChangesToContext([drawFirst]);

    expect(ctx.fillRect).toBeCalledTimes(1);
    expect(ctx.fillRect).toBeCalledWith(50, 30, 400, 80);
  });

  it('should place bars in the center of the panel with a height of 80 px', () => {
    const instructions = convertToInstructions({
      canvasWidth: 500,
      canvasHeight: 300,
      labelsField: data.fields[0],
      valuesField: data.fields[1],
      connectBars: false,
    });

    const ctx = applyChangesToContext(instructions);

    expect(ctx.fillRect).toBeCalledTimes(3);
    expect(ctx.fillRect).nthCalledWith(1, 50, 30, 400, 80);
    expect(ctx.fillRect).nthCalledWith(2, 90, 110, 320, 80);
    expect(ctx.fillRect).nthCalledWith(3, 190, 190, 120, 80);
  });

  it('should connect bars with trapezoid shapes', () => {
    const instructions = convertToInstructions({
      canvasWidth: 500,
      canvasHeight: 300,
      labelsField: data.fields[0],
      valuesField: data.fields[1],
      connectBars: true,
    });

    const ctx = applyChangesToContext(instructions);

    // 1st bar
    expect(ctx.fillRect).nthCalledWith(1, 50, 30, 400, 48);
    // 1st trapezoid
    expect(ctx.beginPath).nthCalledWith(1);
    expect(ctx.moveTo).nthCalledWith(1, 50, 78);
    expect(ctx.lineTo).nthCalledWith(1, 450, 78);
    expect(ctx.lineTo).nthCalledWith(2, 410, 126);
    expect(ctx.lineTo).nthCalledWith(3, 90, 126);
    expect(ctx.lineTo).nthCalledWith(4, 50, 78);
    expect(ctx.fill).nthCalledWith(1);
    // 2nd bar
    expect(ctx.fillRect).nthCalledWith(2, 90, 126, 320, 48);
    // 2nd trapezoid
    expect(ctx.beginPath).nthCalledWith(2);
    expect(ctx.moveTo).nthCalledWith(2, 90, 174);
    expect(ctx.lineTo).nthCalledWith(5, 410, 174);
    expect(ctx.lineTo).nthCalledWith(6, 310, 222);
    expect(ctx.lineTo).nthCalledWith(7, 190, 222);
    expect(ctx.lineTo).nthCalledWith(8, 90, 174);
    expect(ctx.fill).nthCalledWith(2);
    // 3rd bar
    expect(ctx.fillRect).nthCalledWith(3, 190, 222, 120, 48);

    expect(ctx.fillRect).toBeCalledTimes(3);
    expect(ctx.beginPath).toBeCalledTimes(2);
    expect(ctx.moveTo).toBeCalledTimes(2);
    expect(ctx.fill).toBeCalledTimes(2);
  });
});

function applyChangesToContext(instructions: DrawInstruction[]): jest.Mocked<CanvasRenderingContext2D> {
  const ctx = {
    fillRect: jest.fn(),
    moveTo: jest.fn(),
    beginPath: jest.fn(),
    lineTo: jest.fn(),
    fill: jest.fn(),
  } as unknown as jest.Mocked<CanvasRenderingContext2D>;

  for (const instruction of instructions) {
    instruction(ctx);
  }

  return ctx;
}
