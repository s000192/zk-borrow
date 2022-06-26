export const percentFormatter = (value: number) => value.toLocaleString(
  'en-US',
  { style: 'percent', minimumFractionDigits: 2 }
)