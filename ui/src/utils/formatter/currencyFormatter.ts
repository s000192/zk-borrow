export const currencyFormatter = (value: number) => value.toLocaleString(
  'en-US',
  {
    style: "currency",
    currency: "USD",
  }
)