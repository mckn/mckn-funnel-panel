import { DataFrame, FieldType } from '@grafana/data';
import { useMemo } from 'react';
import { convertToInstructions } from './converter';
import { PaintInstruction } from './types';

type InstructionsResult = {
  error?: string;
  instructions?: PaintInstruction[];
};

type InstructionsOptions = {
  width: number;
  height: number;
  data: DataFrame;
};

export function useInstructions(options: InstructionsOptions): InstructionsResult {
  const { width, height, data } = options;

  return useMemo(() => {
    const labelsField = data.fields.find((f) => f.type === FieldType.string);
    const valuesField = data.fields.find((f) => f.type === FieldType.number);

    if (!labelsField || !valuesField) {
      return {
        error: 'invalid data',
      };
    }

    return {
      instructions: convertToInstructions({
        canvasHeight: height,
        canvasWidth: width,
        valuesField: valuesField,
        labelsField: labelsField,
      }),
    };
  }, [width, height, data]);
}
