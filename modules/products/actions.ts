"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProduct, deleteProduct, updateProduct } from "@/modules/products/repository";
import type { ProductFormState } from "@/modules/products/types";
import { validateProductFormData } from "@/modules/products/validation";

const PRODUCTS_PATH = "/dashboard/products";

function errorState(message: string, options?: { sku?: string }): ProductFormState {
  return {
    status: "error",
    message,
    fieldErrors: options?.sku
      ? {
          sku: options.sku,
        }
      : undefined,
  };
}

function buildProductsUrl(options?: { query?: string; success?: string; error?: string }) {
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
  return queryString ? `${PRODUCTS_PATH}?${queryString}` : PRODUCTS_PATH;
}

export async function createProductAction(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const validation = validateProductFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  try {
    await createProduct(validation.data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorState("El SKU ya existe. Usa un SKU diferente.", {
        sku: "El SKU ya esta en uso.",
      });
    }
    return errorState("No se pudo crear el producto. Intentalo nuevamente.");
  }

  revalidatePath(PRODUCTS_PATH);
  revalidatePath("/dashboard/inventory/adjust");
  redirect(buildProductsUrl({ success: "created" }));
}

export async function updateProductAction(
  id: string,
  _: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const validation = validateProductFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  try {
    await updateProduct(id, validation.data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorState("El SKU ya existe. Usa un SKU diferente.", {
        sku: "El SKU ya esta en uso.",
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return errorState("El producto que intentas editar ya no existe.");
    }
    return errorState("No se pudo actualizar el producto. Intentalo nuevamente.");
  }

  revalidatePath(PRODUCTS_PATH);
  revalidatePath(`/dashboard/products/${id}`);
  revalidatePath("/dashboard/inventory/adjust");
  redirect(buildProductsUrl({ success: "updated" }));
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("id");
  const query = formData.get("query");
  const safeQuery = typeof query === "string" ? query.trim() : "";

  if (typeof id !== "string" || id.trim().length === 0) {
    redirect(buildProductsUrl({ query: safeQuery, error: "delete" }));
  }

  try {
    await deleteProduct(id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      redirect(buildProductsUrl({ query: safeQuery, error: "not-found" }));
    }
    redirect(buildProductsUrl({ query: safeQuery, error: "delete" }));
  }

  revalidatePath(PRODUCTS_PATH);
  revalidatePath("/dashboard/inventory/adjust");
  redirect(buildProductsUrl({ query: safeQuery, success: "deleted" }));
}
