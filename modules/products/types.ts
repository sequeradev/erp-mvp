export type ProductInput = {
  name: string;
  sku: string;
  description: string | null;
  price: number;
  cost: number | null;
  isActive: boolean;
};

export type ProductFieldErrors = Partial<Record<keyof ProductInput, string>>;

export type ProductFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: ProductFieldErrors;
};

export const initialProductFormState: ProductFormState = {
  status: "idle",
};
