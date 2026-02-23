import type { Prisma, Product } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getCurrentStockForProduct, getStockMapForProductIds, getStockSummaryForProduct } from "@/modules/inventory/repository";
import type { ProductInput } from "@/modules/products/types";

export type ProductWithStock = Product & {
  currentStock: number;
};

export type ProductDetailWithStock = Product & {
  stock: Awaited<ReturnType<typeof getStockSummaryForProduct>>;
};

export function sanitizeProductSearch(searchQuery?: string) {
  return searchQuery?.trim() ?? "";
}

export async function listProducts(searchQuery?: string): Promise<ProductWithStock[]> {
  const query = sanitizeProductSearch(searchQuery);
  const where: Prisma.ProductWhereInput | undefined = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });

  const stockMap = await getStockMapForProductIds(products.map((product) => product.id));

  return products.map((product) => ({
    ...product,
    currentStock: stockMap.get(product.id) ?? 0,
  }));
}

export async function listProductOptions() {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      isActive: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getProductDetailById(id: string): Promise<ProductDetailWithStock | null> {
  const product = await getProductById(id);

  if (!product) {
    return null;
  }

  const stock = await getStockSummaryForProduct(id);

  return {
    ...product,
    stock,
  };
}

export async function getProductCurrentStock(id: string) {
  return getCurrentStockForProduct(id);
}

export async function createProduct(data: ProductInput) {
  return prisma.product.create({
    data,
  });
}

export async function updateProduct(id: string, data: ProductInput) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany({
      where: { productId: id },
    });

    return tx.product.delete({
      where: { id },
    });
  });
}
