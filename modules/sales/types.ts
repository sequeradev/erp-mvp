import type { SalesOrderStatus } from "@prisma/client";

export type SalesOrderLineInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type SalesOrderInput = {
  customerId: string;
  currency: string;
  notes: string | null;
  lines: SalesOrderLineInput[];
};

export type SalesOrderFormFieldErrors = {
  customerId?: string;
  currency?: string;
  notes?: string;
  lines?: string;
};

export type SalesOrderFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: SalesOrderFormFieldErrors;
};

export type SalesStatusFilter = "ALL" | SalesOrderStatus;

export const initialSalesOrderFormState: SalesOrderFormState = {
  status: "idle",
};
