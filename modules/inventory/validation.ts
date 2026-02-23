import type { InventoryAdjustmentFormState, InventoryAdjustmentInput } from "@/modules/inventory/types";

type InventoryAdjustmentValidationResult =
  | {
      success: true;
      data: InventoryAdjustmentInput;
    }
  | {
      success: false;
      state: InventoryAdjustmentFormState;
    };

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  return value.length > 0 ? value : null;
}

export function validateInventoryAdjustmentFormData(formData: FormData): InventoryAdjustmentValidationResult {
  const productId = normalizeString(formData.get("productId"));
  const quantityRaw = normalizeString(formData.get("quantity"));
  const note = normalizeString(formData.get("note"));

  const fieldErrors: InventoryAdjustmentFormState["fieldErrors"] = {};

  if (!productId) {
    fieldErrors.productId = "Debes seleccionar un producto.";
  }

  const quantity = Number.parseInt(quantityRaw, 10);
  if (!quantityRaw) {
    fieldErrors.quantity = "La cantidad es obligatoria.";
  } else if (!Number.isInteger(quantity)) {
    fieldErrors.quantity = "La cantidad debe ser un numero entero.";
  } else if (quantity === 0) {
    fieldErrors.quantity = "La cantidad no puede ser 0.";
  }

  if (note.length > 255) {
    fieldErrors.note = "La nota no puede superar los 255 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0 || !Number.isInteger(quantity) || quantity === 0) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Revisa los datos del ajuste.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      productId,
      quantity,
      note: optionalValue(note),
    },
  };
}
