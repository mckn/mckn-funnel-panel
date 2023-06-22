export function formatPercentage(value: number): string {
  const raw = value * 100;
  return `${Math.round((raw + Number.EPSILON) * 100) / 100}%`;
}
