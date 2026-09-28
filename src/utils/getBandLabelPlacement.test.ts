import { Orientation } from 'types';
import { getBandLabelPlacement } from './getBandLabelPlacement';

const defaults = {
  start: 100,
  crossSize: 200,
  haloSize: 6,
  textWidth: 40,
  textHeight: 16,
  padding: 4,
};

describe('getBandLabelPlacement', () => {
  describe('horizontal', () => {
    const orientation = Orientation.horizontal;

    it('places the label above the band when there is room', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, thickness: 100 });

      // Band top edge is at 50, minus halo (6), padding (4) and text height (16).
      expect(placement).toEqual({ x: 104, y: 24, inside: false });
    });

    it('places the label inside the band when there is no room above it', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, thickness: 190 });

      expect(placement).toEqual({ x: 104, y: 92, inside: true });
    });

    it('keeps the label outside when it does not fit anywhere', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, crossSize: 20, thickness: 10 });

      expect(placement).toEqual({ x: 104, y: 0, inside: false });
    });
  });

  describe('vertical', () => {
    const orientation = Orientation.vertical;

    it('places the label to the right of the band when there is room', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, thickness: 100 });

      // Band right edge is at 150, plus halo (6) and padding (4).
      expect(placement).toEqual({ x: 160, y: 104, inside: false });
    });

    it('places the label inside the band when there is no room to the right', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, thickness: 188 });

      expect(placement).toEqual({ x: 80, y: 104, inside: true });
    });

    it('keeps the label outside when it does not fit anywhere', () => {
      const placement = getBandLabelPlacement({ ...defaults, orientation, crossSize: 60, thickness: 40 });

      expect(placement).toEqual({ x: 60, y: 104, inside: false });
    });
  });
});
