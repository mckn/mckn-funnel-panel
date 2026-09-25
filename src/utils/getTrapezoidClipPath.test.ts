import { getTrapezoidClipPath } from './getTrapezoidClipPath';

describe('getTrapezoidClipPath', () => {
  it('returns a full rectangle when both edges are 100%', () => {
    expect(getTrapezoidClipPath(1, 1)).toBe('polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  });

  it('narrows the bottom edge towards the center', () => {
    expect(getTrapezoidClipPath(1, 0.5)).toBe('polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)');
  });

  it('widens the bottom edge when the next step is larger', () => {
    expect(getTrapezoidClipPath(0.5, 1)).toBe('polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)');
  });
});
