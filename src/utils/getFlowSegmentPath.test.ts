import { Orientation } from 'types';
import { getFlowSegmentPath } from './getFlowSegmentPath';

const defaults = {
  orientation: Orientation.horizontal,
  start: 0,
  end: 100,
  crossSize: 100,
};

// Returns where the transition starts and ends along the flow, read from the
// first curve command of the horizontal area path.
function getCurveRange(area: string): [number, number] {
  const [, curveStart, curveEnd] = area.match(/L ([\d.]+) [\d.]+ C [\d. ]+? ([\d.]+) [\d.]+ L/) ?? [];
  return [Number(curveStart), Number(curveEnd)];
}

describe('getFlowSegmentPath', () => {
  it('eases from the step thickness to the next step thickness horizontally', () => {
    const paths = getFlowSegmentPath({ ...defaults, fromThickness: 80, toThickness: 40 });

    expect(paths.area).toBe(
      'M 0 10 L 38.33 10 C 45 10 65 30 71.67 30 L 100 30 L 100 70 L 71.67 70 C 65 70 45 90 38.33 90 L 0 90 Z'
    );
  });

  it('only includes the outer edges in the outline', () => {
    const paths = getFlowSegmentPath({ ...defaults, fromThickness: 80, toThickness: 40 });

    expect(paths.edges).toBe(
      'M 0 10 L 38.33 10 C 45 10 65 30 71.67 30 L 100 30 M 100 70 L 71.67 70 C 65 70 45 90 38.33 90 L 0 90'
    );
  });

  it('swaps the axes for the vertical orientation', () => {
    const paths = getFlowSegmentPath({
      ...defaults,
      orientation: Orientation.vertical,
      fromThickness: 80,
      toThickness: 40,
    });

    expect(paths.area).toBe(
      'M 10 0 L 10 38.33 C 10 45 30 65 30 71.67 L 30 100 L 70 100 L 70 71.67 C 70 65 90 45 90 38.33 L 90 0 Z'
    );
  });

  it('uses a short transition when the thickness barely changes', () => {
    const paths = getFlowSegmentPath({ ...defaults, fromThickness: 50, toThickness: 48 });

    expect(getCurveRange(paths.area)).toEqual([40, 70]);
  });

  it('makes the transition longer when the thickness changes a lot', () => {
    const small = getFlowSegmentPath({ ...defaults, fromThickness: 60, toThickness: 40 });
    const large = getFlowSegmentPath({ ...defaults, fromThickness: 80, toThickness: 30 });

    const [smallStart, smallEnd] = getCurveRange(small.area);
    const [largeStart, largeEnd] = getCurveRange(large.area);
    expect(largeEnd - largeStart).toBeGreaterThan(smallEnd - smallStart);
  });

  it('keeps the transition inside the step when the change is too large', () => {
    const paths = getFlowSegmentPath({ ...defaults, fromThickness: 100, toThickness: 0 });

    expect(getCurveRange(paths.area)).toEqual([15, 95]);
  });

  it('offsets the segment by its start position', () => {
    const paths = getFlowSegmentPath({ ...defaults, start: 100, end: 200, fromThickness: 100, toThickness: 100 });

    expect(paths.area).toBe(
      'M 100 0 L 140 0 C 146 0 164 0 170 0 L 200 0 L 200 100 L 170 100 C 164 100 146 100 140 100 L 100 100 Z'
    );
  });
});
