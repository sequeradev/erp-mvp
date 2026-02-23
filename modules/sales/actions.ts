"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { calculateLineTotal, calculateOrderTotals } from "@/modules/sales/calculations";
import {
  cancelSalesOrder,
  confirmSalesOrder,
  createSalesOrderDraft,
  getProductsByIds,
  getSalesCustomerById,
  updateSalesOrderDraft,
} from "@/modules/sales/repository";
import type { SalesOrderFormState } from "@/modules/sales/types";
import { validateSalesOrderFormData } from "@/modules/sales/validation";

function errorState(message: string, fieldErrors?: SalesOrderFormState["fieldErrors"]): SalesOrderFormState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function sanitizeReturnTo(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/dashboard/sales";
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/dashboard/sales")) {
    return "/dashboard/sales";
  }

  return trimmed;
}

function appendRedirectParams(path: string, params: Record<string, string>) {
  const [basePath, queryString = ""] = path.split("?");
  const query = new URLSearchParams(queryString);

  for (const [key, value] of Object.entries(params)) {
    query.set(key, value);
  }

  const finalQuery = query.toString();
  return finalQuery ? `${basePath}?${finalQuery}` : basePath;
}

function getValidatedLinesWithTotals(lines: Array<{ productId: string; quantity: number; unitPrice: number }>) {
  return lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: calculateLineTotal(line.quantity, line.unitPrice),
  }));
}

export async function createSalesOrderAction(
  _: SalesOrderFormState,
  formData: FormData,
): Promise<SalesOrderFormState> {
  const validation = validateSalesOrderFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  const customer = await getSalesCustomerById(validation.data.customerId);
  if (!customer) {
    return errorState("El cliente seleccionado no existe.", {
      customerId: "Cliente no encontrado.",
    });
  }

  const uniqueProductIds = Array.from(new Set(validation.data.lines.map((line) => line.productId)));
  const products = await getProductsByIds(uniqueProductIds);
  if (products.length !== uniqueProductIds.length) {
    return errorState("Una o mas lineas tienen productos invalidos.", {
      lines: "Hay productos no disponibles en el pedido.",
    });
  }

  const linesWithTotals = getValidatedLinesWithTotals(validation.data.lines);
  const totals = calculateOrderTotals(linesWithTotals);

  const createdOrder = await createSalesOrderDraft({
    customerId: validation.data.customerId,
    currency: validation.data.currency,
    notes: validation.data.notes,
    lines: linesWithTotals,
    totals,
  });

  revalidatePath("/dashboard/sales");
  redirect(`/dashboard/sales/${createdOrder.id}?success=created`);
}

export async function updateSalesOrderAction(
  orderId: string,
  _: SalesOrderFormState,
  formData: FormData,
): Promise<SalesOrderFormState> {
  const validation = validateSalesOrderFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  const customer = await getSalesCustomerById(validation.data.customerId);
  if (!customer) {
    return errorState("El cliente seleccionado no existe.", {
      customerId: "Cliente no encontrado.",
    });
  }

  const uniqueProductIds = Array.from(new Set(validation.data.lines.map((line) => line.productId)));
  const products = await getProductsByIds(uniqueProductIds);
  if (products.length !== uniqueProductIds.length) {
    return errorState("Una o mas lineas tienen productos invalidos.", {
      lines: "Hay productos no disponibles en el pedido.",
    });
  }

  const linesWithTotals = getValidatedLinesWithTotals(validation.data.lines);
  const totals = calculateOrderTotals(linesWithTotals);

  const updated = await updateSalesOrderDraft(orderId, {
    customerId: validation.data.customerId,
    currency: validation.data.currency,
    notes: validation.data.notes,
    lines: linesWithTotals,
    totals,
  });

  if (!updated.ok && updated.reason === "NOT_FOUND") {
    return errorState("El pedido no existe.");
  }

  if (!updated.ok && updated.reason === "NOT_DRAFT") {
    return errorState("Solo se pueden editar pedidos en estado DRAFT.");
  }

  revalidatePath("/dashboard/sales");
  revalidatePath(`/dashboard/sales/${orderId}`);
  redirect(`/dashboard/sales/${orderId}?success=updated`);
}

export async function confirmSalesOrderAction(formData: FormData) {
  const orderId = formData.get("orderId");
  const returnTo = sanitizeReturnTo(formData.get("returnTo"));

  if (typeof orderId !== "string" || orderId.trim().length === 0) {
    redirect(appendRedirectParams(returnTo, { error: "invalid-order" }));
  }

  const result = await confirmSalesOrder(orderId);

  if (!result.ok) {
    if (result.reason === "NOT_FOUND") {
      redirect(appendRedirectParams(returnTo, { error: "not-found" }));
    }

    if (result.reason === "INVALID_STATUS") {
      if (result.status === "CONFIRMED") {
        redirect(appendRedirectParams(returnTo, { error: "already-confirmed" }));
      }
      if (result.status === "CANCELLED") {
        redirect(appendRedirectParams(returnTo, { error: "cancelled" }));
      }
      redirect(appendRedirectParams(returnTo, { error: "invalid-status" }));
    }

    redirect(
      appendRedirectParams(returnTo, {
        error: "insufficient-stock",
        product: result.productName,
        available: String(result.available),
        requested: String(result.requested),
      }),
    );
  }

  revalidatePath("/dashboard/sales");
  revalidatePath(`/dashboard/sales/${orderId}`);
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory/adjust");
  redirect(appendRedirectParams(returnTo, { success: "confirmed" }));
}

export async function cancelSalesOrderAction(formData: FormData) {
  const orderId = formData.get("orderId");
  const returnTo = sanitizeReturnTo(formData.get("returnTo"));

  if (typeof orderId !== "string" || orderId.trim().length === 0) {
    redirect(appendRedirectParams(returnTo, { error: "invalid-order" }));
  }

  const result = await cancelSalesOrder(orderId);

  if (!result.ok) {
    if (result.reason === "NOT_FOUND") {
      redirect(appendRedirectParams(returnTo, { error: "not-found" }));
    }

    if (result.status === "CONFIRMED") {
      redirect(appendRedirectParams(returnTo, { error: "cancel-confirmed-not-allowed" }));
    }

    if (result.status === "CANCELLED") {
      redirect(appendRedirectParams(returnTo, { error: "already-cancelled" }));
    }

    redirect(appendRedirectParams(returnTo, { error: "invalid-status" }));
  }

  revalidatePath("/dashboard/sales");
  revalidatePath(`/dashboard/sales/${orderId}`);
  redirect(appendRedirectParams(returnTo, { success: "cancelled" }));
}
