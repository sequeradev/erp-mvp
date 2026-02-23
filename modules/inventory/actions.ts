"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { createStockAdjustment } from "@/modules/inventory/repository";
import type { InventoryAdjustmentFormState } from "@/modules/inventory/types";
import { validateInventoryAdjustmentFormData } from "@/modules/inventory/validation";

const INVENTORY_ADJUST_PATH = "/dashboard/inventory/adjust";

function errorState(message: string): InventoryAdjustmentFormState {
  return {
    status: "error",
    message,
  };
}

export async function createInventoryAdjustmentAction(
  _: InventoryAdjustmentFormState,
  formData: FormData,
): Promise<InventoryAdjustmentFormState> {
  const validation = validateInventoryAdjustmentFormData(formData);

  if (!validation.success) {
    return validation.state;
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: validation.data.productId },
    select: { id: true },
  });

  if (!existingProduct) {
    return {
      status: "error",
      message: "El producto seleccionado no existe.",
      fieldErrors: {
        productId: "Producto no encontrado.",
      },
    };
  }

  try {
    await createStockAdjustment(validation.data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return errorState("No se pudo registrar el ajuste. Intentalo nuevamente.");
    }
    return errorState("Ocurrio un error inesperado al registrar el ajuste.");
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${validation.data.productId}`);
  revalidatePath(INVENTORY_ADJUST_PATH);
  redirect(`${INVENTORY_ADJUST_PATH}?success=adjusted&productId=${validation.data.productId}`);
}
