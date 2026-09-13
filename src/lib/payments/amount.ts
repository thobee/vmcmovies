/** Convert between our DB minor units (kobo/pesewas) and Bachs decimal strings. */

export function minorToDecimal(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}

export function decimalToMinor(amount: string): number {
  return Math.round(parseFloat(amount) * 100);
}

export function displayToDecimal(display: number): string {
  return display.toFixed(2);
}
