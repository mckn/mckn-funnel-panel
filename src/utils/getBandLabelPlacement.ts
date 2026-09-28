import { Orientation } from 'types';

type Options = {
  orientation: Orientation;
  // Position along the flow where the step starts.
  start: number;
  // Size of the drawing area across the flow. The band is centered in it.
  crossSize: number;
  // Thickness of the band at the start of the step.
  thickness: number;
  // Extra space taken by the halo on each side of the band.
  haloSize: number;
  textWidth: number;
  textHeight: number;
  padding: number;
};

type Placement = {
  // Top left corner of the label.
  x: number;
  y: number;
  // True when the label is drawn on top of the band.
  inside: boolean;
};

// Places a label at the start of a step, next to the band. The label goes on
// the outside of the band (above it when horizontal, to the right when
// vertical) when there is room. Otherwise it goes inside the band when it
// fits there, and falls back to the outside if neither fits.
export function getBandLabelPlacement(options: Options): Placement {
  const { orientation, start, crossSize, thickness, haloSize, textWidth, textHeight, padding } = options;
  const center = crossSize / 2;
  const bandEdge = thickness / 2 + haloSize + padding;

  if (orientation === Orientation.horizontal) {
    const x = start + padding;
    const outsideY = center - bandEdge - textHeight;
    const fitsOutside = outsideY >= 0;
    const fitsInside = thickness >= textHeight + padding;

    if (!fitsOutside && fitsInside) {
      return { x, y: center - textHeight / 2, inside: true };
    }
    return { x, y: Math.max(outsideY, 0), inside: false };
  }

  const y = start + padding;
  const outsideX = center + bandEdge;
  const fitsOutside = outsideX + textWidth <= crossSize;
  const fitsInside = thickness >= textWidth + padding * 2;

  if (!fitsOutside && fitsInside) {
    return { x: center - textWidth / 2, y, inside: true };
  }
  return { x: outsideX, y, inside: false };
}
