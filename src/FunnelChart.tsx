import React, { useRef, useEffect, useCallback } from 'react';
import { PanelProps, PanelData } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

interface DataPoint {
  value: number;
  label: string;
  color: string;
}

const convertToDataPoints = (data: PanelData): DataPoint[] => {
  if (!data || !Array.isArray(data.series)) {
    return [];
  }

  const descending = (a: DataPoint, b: DataPoint) => b.value - a.value;

  return data.series
    .reduce((points: DataPoint[], serie) => {
      return serie.fields
        .filter(field => field.type === 'number')
        .reduce((points, field) => {
          const value = field.values.toArray().reduce((total, value) => total + value, 0);

          var hue = Math.floor(Math.random() * 360);
          var pastel = 'hsl(' + hue + ', 100%, 70%)';

          points.push({
            value,
            color: field.config.color?.fixedColor ?? pastel,
            label: '',
          });

          return points;
        }, points);
    }, [])
    .sort(descending);
};

export const FunnelChart: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();

  console.log('data', data);
  const dataPoints = convertToDataPoints(data);
  console.log('points', dataPoints);
  const layout = calculateLayout(dataPoints, width, height);
  console.log('layout', layout);
  const steps = calculateSteps(dataPoints, layout);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {renderWithCanvas(styles, steps, width, height)}
      {/* {renderWithSvg(styles, steps, width, height)} */}
      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
    </div>
  );
};

const renderWithCanvas = (styles: any, steps: FunnelStep[], width: number, height: number) => {
  const draw = useCallback(
    (context: CanvasRenderingContext2D) => {
      for (const step of steps) {
        if (isStage(step)) {
          drawStageBox(context, step);
          drawStageValue(context, step);
          drawStagePercentage(context, step, width);
          continue;
        }

        if (isPassage(step)) {
          drawPassageBox(context, step);
          continue;
        }
      }
    },
    [styles, steps, width, height]
  );
  const canvasRef = useCanvas(draw);

  return <canvas width={width} height={height} ref={canvasRef}></canvas>;
};

const drawPassageBox = (context: CanvasRenderingContext2D, step: FunnelPassage) => {
  const topLeft = `${step.topLeft.x} ${step.topLeft.y}`;
  const topRight = `${step.topRight.x} ${step.topRight.y}`;
  const bottomRight = `${step.bottomRight.x} ${step.bottomRight.y}`;
  const bottomLeft = `${step.bottomLeft.x} ${step.bottomLeft.y}`;
  const passage = new Path2D(`M${topLeft} L${bottomLeft} L${bottomRight} L${topRight} Z`);
  context.fillStyle = step.color;
  context.fill(passage);
};

const drawStageBox = (context: CanvasRenderingContext2D, step: FunnelStage) => {
  const rectangle = new Path2D();
  rectangle.rect(step.point.x, step.point.y, step.width, step.height);
  context.fillStyle = step.color;
  context.fill(rectangle);
};

const drawStageValue = (context: CanvasRenderingContext2D, step: FunnelStage) => {
  context.font = '15px sans-serif';
  context.fillStyle = '#000';
  context.textBaseline = 'middle';

  const value = `${step.value}`;
  const text = context.measureText(value);
  const textY = step.point.y + step.height / 2;
  const textX = step.point.x + step.width / 2 - text.width / 2;

  context.fillText(value, textX, textY);
};

const drawStagePercentage = (context: CanvasRenderingContext2D, step: FunnelStage, width: number) => {
  context.font = '15px sans-serif';
  context.fillStyle = '#FFF';
  context.textBaseline = 'middle';

  const percentage = `${step.percentage.toFixed(2)}%`;
  const text = context.measureText(percentage);
  const textY = step.point.y + step.height / 2;
  const textX = width - 50 - text.width / 2;

  context.fillText(percentage, textX, textY);
};

const useCanvas = (draw: (context: CanvasRenderingContext2D) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    draw(context);
  }, [draw]);
  return canvasRef;
};

const renderWithSvg = (styles: any, steps: FunnelStep[], width: number, height: number) => {
  return (
    <svg
      className={styles.svg}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
    >
      {steps.map((step, index) => {
        if (isStage(step)) {
          return (
            <svg
              key={`stage-${index}`}
              viewBox={`0 0 ${step.width} ${step.height}`}
              width={step.width}
              height={step.height}
              x={step.point.x}
              y={step.point.y}
            >
              <g>
                <rect x="0" y="0" width={step.width} height={step.height} style={{ fill: step.color }}></rect>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">
                  {step.value}
                </text>
              </g>
            </svg>
          );
        }

        if (isPassage(step)) {
          const topLeft = `${step.topLeft.x} ${step.topLeft.y}`;
          const topRight = `${step.topRight.x} ${step.topRight.y}`;
          const bottomRight = `${step.bottomRight.x} ${step.bottomRight.y}`;
          const bottomLeft = `${step.bottomLeft.x} ${step.bottomLeft.y}`;

          const d = `M${topLeft} L${bottomLeft} L${bottomRight} L${topRight} Z`;
          return <path key={`passage-${index}`} d={d} style={{ fill: step.color }} />;
        }

        return null;
      })}
      {renderPercentage(steps, height, styles.percentageText)}
    </svg>
  );
};

const renderPercentage = (steps: FunnelStep[], height: number, textStyle: string): React.ReactNode => {
  if (!Array.isArray(steps) || !isStage(steps[0])) {
    return null;
  }

  const maximumStep = steps[0];
  const x = maximumStep.point.x + maximumStep.width + 28;

  return (
    <svg x={x} y={0} width="100" height={height} viewBox={`0 0 100 ${height}`} key="percentage-container">
      {steps.map((step, index) => {
        if (!isStage(step) || !isStage(maximumStep)) {
          return null;
        }

        return (
          <svg
            x="0"
            y={step.point.y}
            width="100"
            height={step.height}
            viewBox={`0 0 100 ${step.height}`}
            key={`percentage-${index}`}
          >
            <text x="50%" y="50%" className={textStyle} dominant-baseline="middle" text-anchor="middle">
              {step.percentage.toFixed(2)}%
            </text>
          </svg>
        );
      })}
    </svg>
  );
};

const calculateLayout = (data: DataPoint[], width: number, height: number): LayoutMetrics => {
  const titleHeight = 28;
  const rowsForPassages = calculateRowsForPassages(data);
  const rowsForSpacing = 2;

  const rows = data.length + rowsForPassages + rowsForSpacing;
  const rowHeight = height / rows;

  const maxWidth = 500;

  const stageHeight = rowHeight * data.length;
  const passageHeight = (rowHeight / 3) * (data.length - 1);
  const contentHeight = stageHeight + passageHeight;
  const startY = (height - contentHeight) / 2 - titleHeight / 2;
  const startX = width / 2 - maxWidth;

  return {
    startPoint: {
      x: startX,
      y: startY,
    },
    width: maxWidth,
    stageHeight: stageHeight / data.length,
    passageHeight: passageHeight / (rowsForPassages * 3),
  };
};

const calculateRowsForPassages = (data: DataPoint[]): number => {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }
  return (data.length - 1) * (1 / 3);
};

const calculateSteps = (data: DataPoint[], layout: LayoutMetrics): FunnelStep[] => {
  const max = data[0]?.value ?? 0;
  const cache: Record<number, FunnelStage> = {};

  return data.reduce((steps: FunnelStep[], dataPoint, index) => {
    const previousStage = cache[index - 1];
    const currentStage = createStage(dataPoint, layout, index, max);

    if (previousStage) {
      const passage = createPassage(previousStage, currentStage);
      steps.push(passage);
    }

    cache[index] = currentStage;
    steps.push(currentStage);

    return steps;
  }, []);
};

const isStage = (step: FunnelStep): step is FunnelStage => {
  const stage = step as FunnelStage;
  return stage && stage.point && typeof stage.point.x === 'number';
};

const isPassage = (step: FunnelStep): step is FunnelPassage => {
  const passage = step as FunnelPassage;
  return passage && passage.topLeft && typeof passage.topLeft.x === 'number';
};

const createStage = (dataPoint: DataPoint, layout: LayoutMetrics, index: number, max: number): FunnelStage => {
  const width = (dataPoint.value / max) * layout.width;
  const passagesHeight = index * layout.passageHeight;
  const stagesHeight = index * layout.stageHeight;
  const y = layout.startPoint.y + stagesHeight + passagesHeight;
  const x = layout.startPoint.x + (layout.width - width / 2);

  return {
    point: {
      x,
      y,
    },
    width,
    height: layout.stageHeight,
    label: dataPoint.label,
    color: dataPoint.color,
    value: dataPoint.value,
    percentage: (dataPoint.value / max) * 100,
  };
};

const createPassage = (from: FunnelStage, to: FunnelStage): FunnelPassage => {
  return {
    topLeft: {
      x: from.point.x,
      y: from.point.y + from.height,
    },
    topRight: {
      x: from.point.x + from.width,
      y: from.point.y + from.height,
    },
    bottomLeft: to.point,
    bottomRight: {
      x: to.point.x + to.width,
      y: to.point.y,
    },
    label: 'passage',
    color: from.color.replace(', 70%)', ', 80%)'),
    dropOff: 1 - from.value / to.value,
  };
};

interface LayoutMetrics {
  startPoint: Point;
  width: number;
  stageHeight: number;
  passageHeight: number;
}

type FunnelStep = FunnelStage | FunnelPassage;

interface FunnelStage {
  point: Point;
  width: number;
  height: number;
  label: string;
  color: string;
  value: number;
  percentage: number;
}

interface FunnelPassage {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
  label: string;
  color: string;
  dropOff: number;
}

interface Point {
  x: number;
  y: number;
}

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
    percentageText: css`
      fill: #ffffff;
    `,
  };
});
