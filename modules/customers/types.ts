export type CustomerInput = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export type CustomerFieldErrors = Partial<Record<keyof CustomerInput, string>>;

export type CustomerFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: CustomerFieldErrors;
};

export const initialCustomerFormState: CustomerFormState = {
  status: "idle",
};
