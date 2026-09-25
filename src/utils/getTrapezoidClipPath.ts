export function getTrapezoidClipPath(topPercent: number, bottomPercent: number): string {
  const topLeft = 100 * ((1 - topPercent) / 2);
  const topRight = 100 - topLeft;
  const bottomLeft = 100 * ((1 - bottomPercent) / 2);
  const bottomRight = 100 - bottomLeft;

  return `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`;
}
