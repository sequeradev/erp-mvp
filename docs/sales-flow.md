# Sales Flow (MVP)

## Estados del pedido
- `DRAFT`: editable y confirmable.
- `CONFIRMED`: bloqueado para edicion. Ya desconto stock.
- `CANCELLED`: bloqueado para edicion y confirmacion.

## Calculo de totales
- Cada linea guarda:
  - `quantity`
  - `unitPrice`
  - `lineTotal = quantity * unitPrice`
- El pedido guarda:
  - `subtotal = sum(lineTotal)`
  - `tax = subtotal * 0.21`
  - `total = subtotal + tax`
- El calculo se muestra en cliente y siempre se recalcula/valida en servidor.

## Confirmacion y descuento de stock
- La confirmacion solo aplica a pedidos `DRAFT`.
- Antes de confirmar se valida stock disponible por producto con la formula:
  - `SUM(IN) - SUM(OUT) + SUM(ADJUSTMENT)`
- Si algun producto no tiene stock suficiente:
  - no se confirma el pedido
  - se muestra error indicando producto, disponible y solicitado
- Si hay stock suficiente:
  - se ejecuta una transaccion Prisma unica
  - se cambia el estado a `CONFIRMED`
  - se crean movimientos `StockMovement` tipo `OUT` (uno por linea)
- Idempotencia basica:
  - si el pedido ya no esta en `DRAFT`, no se vuelve a descontar stock

## Regla de cancelacion
- En este MVP, solo se permite cancelar pedidos `DRAFT`.
- No se permite cancelar `CONFIRMED` porque no hay flujo de reversa de stock implementado todavia.
