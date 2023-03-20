import { DrawInstruction } from '../types';
import { Bar } from './bar';

type Options = {
  from: Bar;
  to: Bar;
  color: string;
};

export class Trapezoid implements DrawInstruction {
  private from: Bar;
  private to: Bar;
  private color: string;

  constructor(opts: Options) {
    this.from = opts.from;
    this.to = opts.to;
    this.color = opts.color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const topLeft = this.from.bottomLeft;
    const topRight = this.from.bottomRight;
    const bottomLeft = this.to.topLeft;
    const bottomRight = this.to.topRight;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.fill();
    ctx.fillStyle = 'black';
  }
}
