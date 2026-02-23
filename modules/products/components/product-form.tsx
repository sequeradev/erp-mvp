"use client";

import { useActionState } from "react";

import { cn } from "@/lib/utils";
import { initialProductFormState, type ProductFormState } from "@/modules/products/types";

export type ProductFormAction = (
  state: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

type ProductFormProps = {
  action: ProductFormAction;
  submitLabel: string;
  initialValues?: {
    name?: string | null;
    sku?: string | null;
    description?: string | null;
    price?: string | number | null;
    cost?: string | number | null;
    isActive?: boolean;
  };
};

type InputProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "number";
  step?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
};

function TextInput({ id, name, label, type = "text", step, defaultValue, error, required = false }: InputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
          error ? "border-red-400 focus:border-red-500" : "border-zinc-300 focus:border-zinc-500",
        )}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function decimalDefault(value?: string | number | null) {
  if (value === null || value === undefined) {
    return "";
  }
  return typeof value === "number" ? value.toFixed(2) : value;
}

export function ProductForm({ action, submitLabel, initialValues }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialProductFormState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <TextInput
        id="name"
        name="name"
        label="Nombre"
        defaultValue={initialValues?.name ?? ""}
        error={state.fieldErrors?.name}
        required
      />

      <TextInput
        id="sku"
        name="sku"
        label="SKU"
        defaultValue={initialValues?.sku ?? ""}
        error={state.fieldErrors?.sku}
        required
      />

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700">
          Descripcion
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialValues?.description ?? ""}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
            state.fieldErrors?.description
              ? "border-red-400 focus:border-red-500"
              : "border-zinc-300 focus:border-zinc-500",
          )}
        />
        {state.fieldErrors?.description ? (
          <p className="text-xs text-red-600">{state.fieldErrors.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          id="price"
          name="price"
          label="Precio de venta"
          type="number"
          step="0.01"
          defaultValue={decimalDefault(initialValues?.price)}
          error={state.fieldErrors?.price}
          required
        />
        <TextInput
          id="cost"
          name="cost"
          label="Coste"
          type="number"
          step="0.01"
          defaultValue={decimalDefault(initialValues?.cost)}
          error={state.fieldErrors?.cost}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initialValues?.isActive ?? true}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
        />
        Producto activo
      </label>

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
