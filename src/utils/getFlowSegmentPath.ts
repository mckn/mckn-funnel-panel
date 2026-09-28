import { Orientation } from 'types';

// Steepest slope allowed in the transition. The curve is made longer when the
// thickness changes a lot, so a short step with a big drop does not get a
// sharp edge. A slope of 1 is 45 degrees.
const MAX_SLOPE = 0.75;
// Limits for the transition length, as a share of the step length.
const MIN_CURVE_RATIO = 0.3;
const MAX_CURVE_RATIO = 0.8;
// Where the middle of the transition is placed, as a share of the step length.
const CURVE_CENTER = 0.55;
// How much of the transition is rounded, from 0 (a straight diagonal with
// sharp bends) to 0.5 (a full S-curve without any straight part).
const CURVE_TENSION = 0.2;

type Options = {
  orientation: Orientation;
  // Position along the flow where the step starts and ends.
  start: number;
  end: number;
  // Size of the drawing area across the flow. The band is centered in it.
  crossSize: number;
  fromThickness: number;
  toThickness: number;
};

type FlowSegmentPaths = {
  // Closed shape used to fill the step.
  area: string;
  // Only the two outer edges, without the joins to the neighbouring steps.
  // Stroking it gives a continuous outline along the whole band.
  edges: string;
};

// Builds the SVG paths for one step of the flowing funnel band. The band keeps
// `fromThickness` for the first part of the step, eases into `toThickness`
// with an S-curve and keeps that thickness until the end of the step, so it
// joins the next step without a gap.
export function getFlowSegmentPath(options: Options): FlowSegmentPaths {
  const { orientation, start, end, crossSize, fromThickness, toThickness } = options;
  const length = end - start;
  const center = crossSize / 2;
  const from = fromThickness / 2;
  const to = toThickness / 2;

  // The curve has its steepest slope in the middle, at change / (length * (1 - tension)).
  const curveLength = clamp(
    Math.abs(from - to) / ((1 - CURVE_TENSION) * MAX_SLOPE),
    length * MIN_CURVE_RATIO,
    length * MAX_CURVE_RATIO
  );
  const curveStart = clamp(start + length * CURVE_CENTER - curveLength / 2, start, end - curveLength);
  const curveEnd = curveStart + curveLength;
  const firstControl = curveStart + curveLength * CURVE_TENSION;
  const secondControl = curveEnd - curveLength * CURVE_TENSION;

  const point = (along: number, across: number) => {
    return orientation === Orientation.horizontal
      ? `${round(along)} ${round(across)}`
      : `${round(across)} ${round(along)}`;
  };

  const firstEdge = [
    `L ${point(curveStart, center - from)}`,
    `C ${point(firstControl, center - from)} ${point(secondControl, center - to)} ${point(curveEnd, center - to)}`,
    `L ${point(end, center - to)}`,
  ].join(' ');
  const secondEdge = [
    `L ${point(curveEnd, center + to)}`,
    `C ${point(secondControl, center + to)} ${point(firstControl, center + from)} ${point(curveStart, center + from)}`,
    `L ${point(start, center + from)}`,
  ].join(' ');

  return {
    area: `M ${point(start, center - from)} ${firstEdge} L ${point(end, center + to)} ${secondEdge} Z`,
    edges: `M ${point(start, center - from)} ${firstEdge} M ${point(end, center + to)} ${secondEdge}`,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
