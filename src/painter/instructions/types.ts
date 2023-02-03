export type PaintInstruction = FillRect;

export type FillRect = {
  type: 'fillRect';
  x: number;
  y: number;
  w: number;
  h: number;
};
