import type { CustomerFormState, CustomerInput } from "@/modules/customers/types";

type CustomerValidationResult =
  | {
      success: true;
      data: CustomerInput;
    }
  | {
      success: false;
      state: CustomerFormState;
    };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalValue(value: string) {
  return value.length > 0 ? value : null;
}

export function validateCustomerFormData(formData: FormData): CustomerValidationResult {
  const name = normalizeString(formData.get("name"));
  const email = normalizeString(formData.get("email"));
  const phone = normalizeString(formData.get("phone"));
  const address = normalizeString(formData.get("address"));

  const fieldErrors: CustomerFormState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "El nombre es obligatorio.";
  } else if (name.length > 120) {
    fieldErrors.name = "El nombre no puede superar los 120 caracteres.";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Ingresa un email valido.";
  } else if (email.length > 190) {
    fieldErrors.email = "El email no puede superar los 190 caracteres.";
  }

  if (phone.length > 30) {
    fieldErrors.phone = "El telefono no puede superar los 30 caracteres.";
  }

  if (address.length > 255) {
    fieldErrors.address = "La direccion no puede superar los 255 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
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
      email: optionalValue(email),
      phone: optionalValue(phone),
      address: optionalValue(address),
    },
  };
}
