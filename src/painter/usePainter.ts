import { RefObject, useMemo } from 'react';
import { PaintInstruction } from './instructions/types';

export type CanvasPainter = (instructions?: PaintInstruction[]) => void;

export function usePainter(ref?: RefObject<HTMLCanvasElement>): CanvasPainter {
  return useMemo(() => {
    return (instructions: PaintInstruction[] = []) => {
      const context = ref?.current?.getContext('2d');

      if (!context) {
        return;
      }

      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];

        if (instruction.type === 'fillRect') {
          const { x, y, w, h } = instruction;
          context.fillRect(x, y, w, h);
        }
      }
    };
  }, [ref]);
}
