export interface DrawInstruction {
  draw(ctx: CanvasRenderingContext2D): void;
}

export type CanvasPoint = {
  x: number;
  y: number;
};
