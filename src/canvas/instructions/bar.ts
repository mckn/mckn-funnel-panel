import { CanvasPoint, DrawInstruction } from '../types';

type Options = {
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export class Bar implements DrawInstruction {
  private color: string;
  private x: number;
  private y: number;
  private h: number;
  private w: number;

  constructor(opts: Options) {
    this.color = opts.color;
    this.x = opts.x;
    this.y = opts.y;
    this.h = opts.h;
    this.w = opts.w;
  }

  get topLeft(): CanvasPoint {
    return {
      x: this.x,
      y: this.y,
    };
  }

  get topRight(): CanvasPoint {
    return {
      x: this.x + this.w,
      y: this.y,
    };
  }

  get bottomLeft(): CanvasPoint {
    return {
      x: this.x,
      y: this.y + this.h,
    };
  }

  get bottomRight(): CanvasPoint {
    return {
      x: this.x + this.w,
      y: this.y + this.h,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = 'black';
  }
}
