"use client";

import { useActionState } from "react";

import { cn } from "@/lib/utils";
import {
  initialInventoryAdjustmentFormState,
  type InventoryAdjustmentFormState,
} from "@/modules/inventory/types";

export type InventoryAdjustmentFormAction = (
  state: InventoryAdjustmentFormState,
  formData: FormData,
) => Promise<InventoryAdjustmentFormState>;

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  isActive: boolean;
  currentStock: number;
};

type InventoryAdjustFormProps = {
  action: InventoryAdjustmentFormAction;
  products: ProductOption[];
  selectedProductId?: string;
};

export function InventoryAdjustForm({ action, products, selectedProductId }: InventoryAdjustFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialInventoryAdjustmentFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-1">
        <label htmlFor="productId" className="text-sm font-medium text-zinc-700">
          Producto
        </label>
        <select
          id="productId"
          name="productId"
          defaultValue={selectedProductId ?? ""}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
            state.fieldErrors?.productId
              ? "border-red-400 focus:border-red-500"
              : "border-zinc-300 focus:border-zinc-500",
          )}
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} - {product.name} (Stock: {product.currentStock}){product.isActive ? "" : " [Inactivo]"}
            </option>
          ))}
        </select>
        {state.fieldErrors?.productId ? <p className="text-xs text-red-600">{state.fieldErrors.productId}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="quantity" className="text-sm font-medium text-zinc-700">
          Cantidad (+ o -)
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          step="1"
          placeholder="Ej: 5 o -3"
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
            state.fieldErrors?.quantity ? "border-red-400 focus:border-red-500" : "border-zinc-300 focus:border-zinc-500",
          )}
        />
        {state.fieldErrors?.quantity ? <p className="text-xs text-red-600">{state.fieldErrors.quantity}</p> : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium text-zinc-700">
          Nota
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Motivo del ajuste"
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
            state.fieldErrors?.note ? "border-red-400 focus:border-red-500" : "border-zinc-300 focus:border-zinc-500",
          )}
        />
        {state.fieldErrors?.note ? <p className="text-xs text-red-600">{state.fieldErrors.note}</p> : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isPending ? "Guardando..." : "Registrar ajuste"}
      </button>
    </form>
  );
}
