import type { ProductFormState, ProductInput } from "@/modules/products/types";

type ProductValidationResult =
  | {
      success: true;
      data: ProductInput;
    }
  | {
      success: false;
      state: ProductFormState;
    };

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  return value.length > 0 ? value : null;
}

function parseDecimal(value: string) {
  const normalized = value.replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function validateProductFormData(formData: FormData): ProductValidationResult {
  const name = normalizeString(formData.get("name"));
  const rawSku = normalizeString(formData.get("sku"));
  const description = normalizeString(formData.get("description"));
  const priceRaw = normalizeString(formData.get("price"));
  const costRaw = normalizeString(formData.get("cost"));
  const isActive = formData.get("isActive") === "on";
  const sku = rawSku.toUpperCase();

  const fieldErrors: ProductFormState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "El nombre es obligatorio.";
  } else if (name.length > 150) {
    fieldErrors.name = "El nombre no puede superar los 150 caracteres.";
  }

  if (!sku) {
    fieldErrors.sku = "El SKU es obligatorio.";
  } else if (sku.length > 80) {
    fieldErrors.sku = "El SKU no puede superar los 80 caracteres.";
  }

  if (description.length > 500) {
    fieldErrors.description = "La descripcion no puede superar los 500 caracteres.";
  }

  if (!priceRaw) {
    fieldErrors.price = "El precio es obligatorio.";
  }

  const price = priceRaw ? parseDecimal(priceRaw) : null;
  if (priceRaw && price === null) {
    fieldErrors.price = "Ingresa un precio valido.";
  } else if (price !== null && price < 0) {
    fieldErrors.price = "El precio debe ser mayor o igual a 0.";
  }

  const cost = costRaw ? parseDecimal(costRaw) : null;
  if (costRaw && cost === null) {
    fieldErrors.cost = "Ingresa un coste valido.";
  } else if (cost !== null && cost < 0) {
    fieldErrors.cost = "El coste debe ser mayor o igual a 0.";
  }

  if (Object.keys(fieldErrors).length > 0 || price === null) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Revisa los campos marcados.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      name,
      sku,
      description: optionalValue(description),
      price,
      cost,
      isActive,
    },
  };
}
