export type InventoryAdjustmentInput = {
  productId: string;
  quantity: number;
  note: string | null;
};

export type InventoryAdjustmentFieldErrors = Partial<Record<keyof InventoryAdjustmentInput, string>>;

export type InventoryAdjustmentFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: InventoryAdjustmentFieldErrors;
};

export const initialInventoryAdjustmentFormState: InventoryAdjustmentFormState = {
  status: "idle",
};
