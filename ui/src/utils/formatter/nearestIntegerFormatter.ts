export const nearestIntegerFormatter = (value: number) => value.toLocaleString(
  'en-US',
  { maximumFractionDigits: 0 }
)