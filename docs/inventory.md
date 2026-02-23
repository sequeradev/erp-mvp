# Inventory Base Decisions

## Scope
- Implemented a minimal inventory base with `StockMovement` and `ADJUSTMENT` UI only.
- No purchase/sales flows yet.

## Stock Formula
- Current stock is calculated as:
  - `SUM(IN) - SUM(OUT) + SUM(ADJUSTMENT)`

## Adjustment Quantity
- In `/dashboard/inventory/adjust`, quantity accepts positive and negative integers.
- Positive quantity increases stock.
- Negative quantity decreases stock.
- `0` is rejected.

## Product Delete Behavior
- Deleting a product removes its stock movements first (inside a transaction) to keep referential integrity and allow product deletion from the UI.
