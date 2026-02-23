"use client";

import { useActionState } from "react";

import { cn } from "@/lib/utils";
import { initialCustomerFormState, type CustomerFormState } from "@/modules/customers/types";

export type CustomerFormAction = (
  state: CustomerFormState,
  formData: FormData,
) => Promise<CustomerFormState>;

type CustomerFormProps = {
  action: CustomerFormAction;
  submitLabel: string;
  initialValues?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
};

type InputProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email";
  defaultValue?: string;
  error?: string;
  required?: boolean;
};

function TextInput({ id, name, label, type = "text", defaultValue, error, required = false }: InputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
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

export function CustomerForm({ action, submitLabel, initialValues }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialCustomerFormState);

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
        id="email"
        name="email"
        type="email"
        label="Email"
        defaultValue={initialValues?.email ?? ""}
        error={state.fieldErrors?.email}
      />

      <TextInput
        id="phone"
        name="phone"
        label="Telefono"
        defaultValue={initialValues?.phone ?? ""}
        error={state.fieldErrors?.phone}
      />

      <div className="space-y-1">
        <label htmlFor="address" className="text-sm font-medium text-zinc-700">
          Direccion
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={initialValues?.address ?? ""}
          className={cn(
            "w-full rounded-md border px-3 py-2 text-sm text-zinc-900 outline-none transition",
            state.fieldErrors?.address
              ? "border-red-400 focus:border-red-500"
              : "border-zinc-300 focus:border-zinc-500",
          )}
        />
        {state.fieldErrors?.address ? <p className="text-xs text-red-600">{state.fieldErrors.address}</p> : null}
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
