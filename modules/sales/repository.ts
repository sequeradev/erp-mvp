import { Prisma, SalesOrderStatus, StockMovementType } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { SalesStatusFilter } from "@/modules/sales/types";

type SalesOrderLineWrite = {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type SalesOrderTotalsWrite = {
  subtotal: number;
  tax: number;
  total: number;
};

type SalesOrderWriteInput = {
  customerId: string;
  currency: string;
  notes: string | null;
  lines: SalesOrderLineWrite[];
  totals: SalesOrderTotalsWrite;
};

export type ConfirmSalesOrderResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" }
  | { ok: false; reason: "INVALID_STATUS"; status: SalesOrderStatus }
  | { ok: false; reason: "INSUFFICIENT_STOCK"; productName: string; available: number; requested: number };

export type CancelSalesOrderResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" }
  | { ok: false; reason: "INVALID_STATUS"; status: SalesOrderStatus };

type SalesFilters = {
  query?: string;
  status?: SalesStatusFilter;
};

export function sanitizeSalesSearch(searchQuery?: string) {
  return searchQuery?.trim() ?? "";
}

export function sanitizeSalesStatus(statusRaw?: string): SalesStatusFilter {
  if (statusRaw === "DRAFT" || statusRaw === "CONFIRMED" || statusRaw === "CANCELLED") {
    return statusRaw;
  }
  return "ALL";
}

export async function listSalesOrders(filters?: SalesFilters) {
  const query = sanitizeSalesSearch(filters?.query);
  const status = filters?.status ?? "ALL";

  const andConditions: Prisma.SalesOrderWhereInput[] = [];

  if (status !== "ALL") {
    andConditions.push({ status });
  }

  if (query) {
    andConditions.push({
      customer: {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      },
    });
  }

  const where: Prisma.SalesOrderWhereInput | undefined = andConditions.length > 0 ? { AND: andConditions } : undefined;

  return prisma.salesOrder.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          lines: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function listCustomersForSalesForm() {
  return prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function listProductsForSalesForm() {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getSalesCustomerById(customerId: string) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });
}

export async function getProductsByIds(productIds: string[]) {
  if (productIds.length === 0) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      isActive: true,
    },
  });
}

export async function getSalesOrderById(id: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      lines: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: [{ id: "asc" }],
      },
    },
  });
}

export async function createSalesOrderDraft(input: SalesOrderWriteInput) {
  return prisma.salesOrder.create({
    data: {
      customerId: input.customerId,
      currency: input.currency,
      notes: input.notes,
      status: "DRAFT",
      subtotal: input.totals.subtotal,
      tax: input.totals.tax,
      total: input.totals.total,
      lines: {
        createMany: {
          data: input.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
          })),
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function updateSalesOrderDraft(
  id: string,
  input: SalesOrderWriteInput,
): Promise<{ ok: true } | { ok: false; reason: "NOT_FOUND" | "NOT_DRAFT" }> {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!order) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (order.status !== "DRAFT") {
    return { ok: false, reason: "NOT_DRAFT" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.salesOrder.update({
      where: { id },
      data: {
        customerId: input.customerId,
        currency: input.currency,
        notes: input.notes,
        subtotal: input.totals.subtotal,
        tax: input.totals.tax,
        total: input.totals.total,
      },
    });

    await tx.salesOrderLine.deleteMany({
      where: { salesOrderId: id },
    });

    await tx.salesOrderLine.createMany({
      data: input.lines.map((line) => ({
        salesOrderId: id,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
    });
  });

  return { ok: true };
}

function stockContribution(type: StockMovementType, quantity: number) {
  if (type === "OUT") {
    return -quantity;
  }
  return quantity;
}

function appendStockFromRows(
  rows: Array<{ productId: string; type: StockMovementType; _sum: { quantity: number | null } }>,
) {
  const stockMap = new Map<string, number>();

  for (const row of rows) {
    const currentValue = stockMap.get(row.productId) ?? 0;
    const quantity = row._sum.quantity ?? 0;
    stockMap.set(row.productId, currentValue + stockContribution(row.type, quantity));
  }

  return stockMap;
}

export async function confirmSalesOrder(orderId: string): Promise<ConfirmSalesOrderResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        lines: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { ok: false, reason: "NOT_FOUND" };
    }

    if (order.status !== "DRAFT") {
      return { ok: false, reason: "INVALID_STATUS", status: order.status };
    }

    if (order.lines.length === 0) {
      return {
        ok: false,
        reason: "INSUFFICIENT_STOCK",
        productName: "Pedido sin lineas",
        available: 0,
        requested: 1,
      };
    }

    const requestedByProduct = new Map<string, { requested: number; productName: string }>();

    for (const line of order.lines) {
      const existing = requestedByProduct.get(line.productId);
      if (existing) {
        existing.requested += line.quantity;
      } else {
        requestedByProduct.set(line.productId, {
          requested: line.quantity,
          productName: line.product.name,
        });
      }
    }

    const stockRows = await tx.stockMovement.groupBy({
      by: ["productId", "type"],
      where: {
        productId: {
          in: Array.from(requestedByProduct.keys()),
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const stockMap = appendStockFromRows(stockRows);

    for (const [productId, requestedData] of requestedByProduct.entries()) {
      const available = stockMap.get(productId) ?? 0;
      if (available < requestedData.requested) {
        return {
          ok: false,
          reason: "INSUFFICIENT_STOCK",
          productName: requestedData.productName,
          available,
          requested: requestedData.requested,
        };
      }
    }

    const updated = await tx.salesOrder.updateMany({
      where: {
        id: orderId,
        status: "DRAFT",
      },
      data: {
        status: "CONFIRMED",
      },
    });

    if (updated.count !== 1) {
      const currentOrder = await tx.salesOrder.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      return {
        ok: false,
        reason: "INVALID_STATUS",
        status: currentOrder?.status ?? "CONFIRMED",
      };
    }

    await tx.stockMovement.createMany({
      data: order.lines.map((line) => ({
        productId: line.productId,
        type: "OUT",
        quantity: line.quantity,
        note: `Sale order ${order.id}`,
      })),
    });

    return { ok: true };
  });
}

export async function cancelSalesOrder(orderId: string): Promise<CancelSalesOrderResult> {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    select: {
      status: true,
    },
  });

  if (!order) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  if (order.status !== "DRAFT") {
    return { ok: false, reason: "INVALID_STATUS", status: order.status };
  }

  await prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  return { ok: true };
}
