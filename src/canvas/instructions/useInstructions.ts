import { DataFrame } from '@grafana/data';
import { useMemo } from 'react';
import { convertToInstructions } from './converter';
import { DrawInstruction } from '../types';
import { dataFramesToFunnelData } from './dataMapper';
import { useTheme2 } from '@grafana/ui';

type InstructionsResult = {
  error?: string;
  instructions?: DrawInstruction[];
};

type InstructionsOptions = {
  width: number;
  height: number;
  data: DataFrame[];
};

export function useInstructions(options: InstructionsOptions): InstructionsResult {
  const { width, height, data } = options;
  const theme = useTheme2();

  return useMemo(() => {
    const funnelData = dataFramesToFunnelData(data, theme);

    if (funnelData.length === 0) {
      return {
        error: 'invalid data',
      };
    }

    return {
      instructions: convertToInstructions({
        canvasHeight: height,
        canvasWidth: width,
        data: funnelData,
        connectBars: true,
      }),
    };
  }, [width, height, data, theme]);
}
