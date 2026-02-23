"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCustomer, deleteCustomer, updateCustomer } from "@/modules/customers/repository";
import type { CustomerFormState } from "@/modules/customers/types";
import { validateCustomerFormData } from "@/modules/customers/validation";

const CUSTOMERS_PATH = "/dashboard/customers";

function errorState(message: string): CustomerFormState {
  return {
    status: "error",
    message,
  };
}

function buildCustomersUrl(options?: { query?: string; success?: string; error?: string }) {
  const params = new URLSearchParams();

  if (options?.query) {
    params.set("query", options.query);
  }
  if (options?.success) {
    params.set("success", options.success);
  }
  if (options?.error) {
    params.set("error", options.error);
  }

  const queryString = params.toString();
  return queryString ? `${CUSTOMERS_PATH}?${queryString}` : CUSTOMERS_PATH;
}

export async function createCustomerAction(
  _: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const validation = validateCustomerFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  try {
    await createCustomer(validation.data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return errorState("No se pudo crear el cliente. Intentalo nuevamente.");
    }
    return errorState("Ocurrio un error inesperado al crear el cliente.");
  }

  revalidatePath(CUSTOMERS_PATH);
  redirect(buildCustomersUrl({ success: "created" }));
}

export async function updateCustomerAction(
  id: string,
  _: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const validation = validateCustomerFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  try {
    await updateCustomer(id, validation.data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return errorState("El cliente que intentas editar ya no existe.");
    }
    return errorState("No se pudo actualizar el cliente. Intentalo nuevamente.");
  }

  revalidatePath(CUSTOMERS_PATH);
  redirect(buildCustomersUrl({ success: "updated" }));
}

export async function deleteCustomerAction(formData: FormData) {
  const id = formData.get("id");
  const query = formData.get("query");
  const safeQuery = typeof query === "string" ? query.trim() : "";

  if (typeof id !== "string" || id.trim().length === 0) {
    redirect(buildCustomersUrl({ query: safeQuery, error: "delete" }));
  }

  try {
    await deleteCustomer(id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      redirect(buildCustomersUrl({ query: safeQuery, error: "not-found" }));
    }
    redirect(buildCustomersUrl({ query: safeQuery, error: "delete" }));
  }

  revalidatePath(CUSTOMERS_PATH);
  redirect(buildCustomersUrl({ query: safeQuery, success: "deleted" }));
}
