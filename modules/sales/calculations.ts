export const SALES_TAX_RATE = 0.21;

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function calculateOrderTotals(lines: Array<{ quantity: number; unitPrice: number }>) {
  const subtotal = roundMoney(
    lines.reduce((acc, line) => {
      return acc + calculateLineTotal(line.quantity, line.unitPrice);
    }, 0),
  );
  const tax = roundMoney(subtotal * SALES_TAX_RATE);
  const total = roundMoney(subtotal + tax);

  return {
    subtotal,
    tax,
    total,
  };
}
