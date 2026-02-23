import type { SalesOrderFormState, SalesOrderInput, SalesOrderLineInput } from "@/modules/sales/types";

type SalesOrderValidationResult =
  | {
      success: true;
      data: SalesOrderInput;
    }
  | {
      success: false;
      state: SalesOrderFormState;
    };

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  return value.length > 0 ? value : null;
}

function parseLinesPayload(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function validateLineCandidate(candidate: unknown): SalesOrderLineInput | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const lineObject = candidate as Record<string, unknown>;
  const productId = typeof lineObject.productId === "string" ? lineObject.productId.trim() : "";
  const quantity = typeof lineObject.quantity === "number" ? lineObject.quantity : Number.NaN;
  const unitPrice = typeof lineObject.unitPrice === "number" ? lineObject.unitPrice : Number.NaN;

  if (!productId) {
    return null;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return null;
  }
  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    return null;
  }

  return {
    productId,
    quantity,
    unitPrice,
  };
}

export function validateSalesOrderFormData(formData: FormData): SalesOrderValidationResult {
  const customerId = normalizeString(formData.get("customerId"));
  const currency = normalizeString(formData.get("currency")) || "EUR";
  const notes = normalizeString(formData.get("notes"));
  const linesPayloadRaw = normalizeString(formData.get("linesPayload"));

  const fieldErrors: SalesOrderFormState["fieldErrors"] = {};

  if (!customerId) {
    fieldErrors.customerId = "Debes seleccionar un cliente.";
  }

  if (!currency) {
    fieldErrors.currency = "La moneda es obligatoria.";
  } else if (currency.length > 8) {
    fieldErrors.currency = "La moneda no puede superar los 8 caracteres.";
  }

  if (notes.length > 500) {
    fieldErrors.notes = "Las notas no pueden superar los 500 caracteres.";
  }

  const parsedLines = parseLinesPayload(linesPayloadRaw);
  const lines: SalesOrderLineInput[] = Array.isArray(parsedLines)
    ? parsedLines
        .map((candidate) => validateLineCandidate(candidate))
        .filter((line): line is SalesOrderLineInput => line !== null)
    : [];

  if (lines.length === 0) {
    fieldErrors.lines = "Debes agregar al menos una linea valida.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      state: {
        status: "error",
        message: "Revisa los campos del pedido.",
        fieldErrors,
      },
    };
  }

  return {
    success: true,
    data: {
      customerId,
      currency: currency.toUpperCase(),
      notes: optionalValue(notes),
      lines,
    },
  };
}
