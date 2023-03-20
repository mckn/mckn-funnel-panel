import { RefObject, useMemo } from 'react';
import { DrawInstruction } from './types';

type CanvasDrawer = (instructions?: DrawInstruction[]) => void;

export function useCanvasDrawer(ref?: RefObject<HTMLCanvasElement>): CanvasDrawer {
  return useMemo(() => {
    return (instructions: DrawInstruction[] = []) => {
      const context = ref?.current?.getContext('2d');

      if (!context || instructions.length === 0) {
        return;
      }

      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        instruction.draw(context);
      }
    };
  }, [ref]);
}
