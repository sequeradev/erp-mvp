"use client";

import { useActionState, useMemo, useState } from "react";

import { calculateOrderTotals, calculateLineTotal, roundMoney } from "@/modules/sales/calculations";
import { initialSalesOrderFormState, type SalesOrderFormState } from "@/modules/sales/types";

type SalesOrderFormAction = (
  state: SalesOrderFormState,
  formData: FormData,
) => Promise<SalesOrderFormState>;

type CustomerOption = {
  id: string;
  name: string;
  email: string | null;
};

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  price: string;
  isActive: boolean;
};

type SalesOrderLineDraft = {
  rowId: string;
  productId: string;
  quantity: string;
  unitPrice: string;
};

type SalesOrderFormProps = {
  action: SalesOrderFormAction;
  submitLabel: string;
  customers: CustomerOption[];
  products: ProductOption[];
  initialValues?: {
    customerId?: string;
    notes?: string | null;
    currency?: string;
    lines?: Array<{
      productId: string;
      quantity: number;
      unitPrice: string;
    }>;
  };
};

function makeRowId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toDecimal(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function getDefaultLine(products: ProductOption[]): SalesOrderLineDraft {
  const firstActive = products.find((product) => product.isActive) ?? products[0];
  return {
    rowId: makeRowId(),
    productId: firstActive?.id ?? "",
    quantity: "1",
    unitPrice: firstActive?.price ?? "0.00",
  };
}

export function SalesOrderForm({ action, submitLabel, customers, products, initialValues }: SalesOrderFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialSalesOrderFormState);

  const [lines, setLines] = useState<SalesOrderLineDraft[]>(() => {
    if (initialValues?.lines && initialValues.lines.length > 0) {
      return initialValues.lines.map((line) => ({
        rowId: makeRowId(),
        productId: line.productId,
        quantity: String(line.quantity),
        unitPrice: line.unitPrice,
      }));
    }
    return [getDefaultLine(products)];
  });

  const productById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const calculatedLines = useMemo(() => {
    return lines.map((line) => {
      const quantity = toInteger(line.quantity);
      const unitPrice = toDecimal(line.unitPrice);
      return {
        productId: line.productId,
        quantity,
        unitPrice,
        lineTotal: calculateLineTotal(quantity, unitPrice),
      };
    });
  }, [lines]);

  const totals = useMemo(() => {
    return calculateOrderTotals(calculatedLines);
  }, [calculatedLines]);

  const linesPayload = useMemo(() => {
    return JSON.stringify(
      calculatedLines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: roundMoney(line.unitPrice),
      })),
    );
  }, [calculatedLines]);

  function addLine() {
    setLines((current) => [...current, getDefaultLine(products)]);
  }

  function removeLine(rowId: string) {
    setLines((current) => current.filter((line) => line.rowId !== rowId));
  }

  function updateLine(rowId: string, patch: Partial<SalesOrderLineDraft>) {
    setLines((current) => current.map((line) => (line.rowId === rowId ? { ...line, ...patch } : line)));
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <input type="hidden" name="currency" value={initialValues?.currency ?? "EUR"} />
      <input type="hidden" name="linesPayload" value={linesPayload} />

      <div className="space-y-1">
        <label htmlFor="customerId" className="text-sm font-medium text-zinc-700">
          Cliente
        </label>
        <select
          id="customerId"
          name="customerId"
          defaultValue={initialValues?.customerId ?? ""}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
        >
          <option value="">Selecciona un cliente</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
              {customer.email ? ` (${customer.email})` : ""}
            </option>
          ))}
        </select>
        {state.fieldErrors?.customerId ? <p className="text-xs text-red-600">{state.fieldErrors.customerId}</p> : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">Lineas del pedido</label>
          <button
            type="button"
            onClick={addLine}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Agregar linea
          </button>
        </div>

        <div className="space-y-2">
          {lines.map((line, index) => {
            const selectedProduct = productById.get(line.productId);

            return (
              <div key={line.rowId} className="grid gap-2 rounded-md border border-zinc-200 p-3 md:grid-cols-12">
                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Producto</label>
                  <select
                    value={line.productId}
                    onChange={(event) => {
                      const nextProduct = productById.get(event.target.value);
                      updateLine(line.rowId, {
                        productId: event.target.value,
                        unitPrice: nextProduct?.price ?? "0.00",
                      });
                    }}
                    className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                        {product.isActive ? "" : " [Inactivo]"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={line.quantity}
                    onChange={(event) => updateLine(line.rowId, { quantity: event.target.value })}
                    className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Precio</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(line.rowId, { unitPrice: event.target.value })}
                    className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Total</label>
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-700">
                    {formatCurrency(calculatedLines[index]?.lineTotal ?? 0)}
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">Accion</label>
                  <button
                    type="button"
                    onClick={() => removeLine(line.rowId)}
                    className="w-full rounded-md border border-red-300 px-2 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                  >
                    Quitar
                  </button>
                </div>
                {selectedProduct ? (
                  <p className="md:col-span-12 text-xs text-zinc-500">
                    SKU: {selectedProduct.sku}
                    {selectedProduct.isActive ? "" : " - Producto inactivo"}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {state.fieldErrors?.lines ? <p className="text-xs text-red-600">{state.fieldErrors.lines}</p> : null}
      </div>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>IVA (21%)</span>
          <span>{formatCurrency(totals.tax)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-700">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initialValues?.notes ?? ""}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
        />
        {state.fieldErrors?.notes ? <p className="text-xs text-red-600">{state.fieldErrors.notes}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
