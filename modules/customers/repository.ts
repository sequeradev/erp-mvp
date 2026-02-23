import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { CustomerInput } from "@/modules/customers/types";

export function sanitizeCustomerSearch(searchQuery?: string) {
  return searchQuery?.trim() ?? "";
}

export async function listCustomers(searchQuery?: string) {
  const query = sanitizeCustomerSearch(searchQuery);
  const where: Prisma.CustomerWhereInput | undefined = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  return prisma.customer.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
  });
}

export async function createCustomer(data: CustomerInput) {
  return prisma.customer.create({
    data,
  });
}

export async function updateCustomer(id: string, data: CustomerInput) {
  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.delete({
    where: { id },
  });
}
