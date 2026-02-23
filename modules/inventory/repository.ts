import { StockMovementType, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type StockSummary = {
  in: number;
  out: number;
  adjustment: number;
  current: number;
};

function contributionByType(type: StockMovementType, quantity: number) {
  if (type === "IN") {
    return quantity;
  }
  if (type === "OUT") {
    return -quantity;
  }
  return quantity;
}

export async function getStockMapForProductIds(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, number>();
  }

  const grouped = await prisma.stockMovement.groupBy({
    by: ["productId", "type"],
    where: {
      productId: {
        in: productIds,
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const stockMap = new Map<string, number>();

  for (const row of grouped) {
    const currentValue = stockMap.get(row.productId) ?? 0;
    const quantity = row._sum.quantity ?? 0;
    stockMap.set(row.productId, currentValue + contributionByType(row.type, quantity));
  }

  return stockMap;
}

export async function getCurrentStockForProduct(productId: string) {
  const stockMap = await getStockMapForProductIds([productId]);
  return stockMap.get(productId) ?? 0;
}

export async function getStockSummaryForProduct(productId: string): Promise<StockSummary> {
  const grouped = await prisma.stockMovement.groupBy({
    by: ["type"],
    where: {
      productId,
    },
    _sum: {
      quantity: true,
    },
  });

  let inValue = 0;
  let outValue = 0;
  let adjustmentValue = 0;

  for (const row of grouped) {
    const quantity = row._sum.quantity ?? 0;

    if (row.type === "IN") {
      inValue = quantity;
    }
    if (row.type === "OUT") {
      outValue = quantity;
    }
    if (row.type === "ADJUSTMENT") {
      adjustmentValue = quantity;
    }
  }

  return {
    in: inValue,
    out: outValue,
    adjustment: adjustmentValue,
    current: inValue - outValue + adjustmentValue,
  };
}

export async function createStockAdjustment(input: { productId: string; quantity: number; note: string | null }) {
  return prisma.stockMovement.create({
    data: {
      productId: input.productId,
      type: "ADJUSTMENT",
      quantity: input.quantity,
      note: input.note,
    },
  });
}

export async function listRecentMovementsByProduct(productId: string, limit = 20) {
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export async function listProductsForInventoryAdjust() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });

  const stockMap = await getStockMapForProductIds(products.map((product) => product.id));

  return products.map((product) => ({
    ...product,
    currentStock: stockMap.get(product.id) ?? 0,
  }));
}

export type StockMovementListRow = Prisma.StockMovementGetPayload<{
  select: {
    id: true;
    type: true;
    quantity: true;
    note: true;
    createdAt: true;
  };
}>;
