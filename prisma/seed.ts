import { prisma } from "@/lib/db";
import type { StockMovementType } from "@prisma/client";

const SALES_TAX_RATE = 0.21;

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

async function main() {
  const sampleCustomers = [
    {
      name: "Acme Industries",
      email: "acme@example.com",
      phone: "+34 900 100 200",
      address: "Calle Norte 15, Madrid",
    },
    {
      name: "Globex Retail",
      email: "globex@example.com",
      phone: "+34 900 300 400",
      address: "Avenida Sur 21, Valencia",
    },
    {
      name: "Initech Services",
      email: "initech@example.com",
      phone: "+34 900 500 600",
      address: "Gran Via 10, Barcelona",
    },
  ];

  const sampleProducts = [
    {
      name: "Laptop Pro 14",
      sku: "PROD-LAP-001",
      description: "Laptop profesional 14 pulgadas",
      price: 1499.99,
      cost: 1099.0,
      isActive: true,
    },
    {
      name: "Monitor 27 IPS",
      sku: "PROD-MON-002",
      description: "Monitor 27 pulgadas panel IPS",
      price: 329.5,
      cost: 220.0,
      isActive: true,
    },
    {
      name: "Teclado Mecanico",
      sku: "PROD-KEY-003",
      description: "Teclado mecanico para oficina",
      price: 89.9,
      cost: 45.0,
      isActive: true,
    },
    {
      name: "Mouse Inalambrico",
      sku: "PROD-MOU-004",
      description: "Mouse ergonomico inalambrico",
      price: 39.5,
      cost: 18.25,
      isActive: true,
    },
    {
      name: "Silla Operativa",
      sku: "PROD-CHA-005",
      description: "Silla operativa regulable",
      price: 219.0,
      cost: 142.0,
      isActive: true,
    },
    {
      name: "Webcam HD",
      sku: "PROD-WEB-006",
      description: "Webcam para videollamadas",
      price: 74.9,
      cost: 33.4,
      isActive: true,
    },
    {
      name: "Dock USB-C",
      sku: "PROD-DOCK-007",
      description: "Dock USB-C multipuerto",
      price: 129.0,
      cost: 78.0,
      isActive: false,
    },
  ];

  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();

  await prisma.customer.createMany({
    data: sampleCustomers,
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: sampleProducts,
  });

  const [createdProducts, createdCustomers] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        price: true,
      },
    }),
    prisma.customer.findMany({
      where: {
        email: {
          in: sampleCustomers.map((customer) => customer.email),
        },
      },
      select: {
        id: true,
        email: true,
      },
    }),
  ]);

  const productBySku = new Map(createdProducts.map((product) => [product.sku, product]));
  const customerIdByEmail = new Map(createdCustomers.map((customer) => [customer.email ?? "", customer.id]));

  const sampleMovements: Array<{
    sku: string;
    type: StockMovementType;
    quantity: number;
    note: string;
  }> = [
    { sku: "PROD-LAP-001", type: "IN", quantity: 20, note: "Stock inicial" },
    { sku: "PROD-LAP-001", type: "OUT", quantity: 4, note: "Salida demo" },
    { sku: "PROD-LAP-001", type: "ADJUSTMENT", quantity: -1, note: "Ajuste inventario" },
    { sku: "PROD-MON-002", type: "IN", quantity: 35, note: "Stock inicial" },
    { sku: "PROD-MON-002", type: "OUT", quantity: 6, note: "Entrega interna" },
    { sku: "PROD-KEY-003", type: "IN", quantity: 80, note: "Stock inicial" },
    { sku: "PROD-KEY-003", type: "OUT", quantity: 15, note: "Venta previa" },
    { sku: "PROD-MOU-004", type: "IN", quantity: 90, note: "Stock inicial" },
    { sku: "PROD-CHA-005", type: "IN", quantity: 12, note: "Stock inicial" },
    { sku: "PROD-WEB-006", type: "IN", quantity: 40, note: "Stock inicial" },
    { sku: "PROD-WEB-006", type: "ADJUSTMENT", quantity: 2, note: "Conteo fisico" },
    { sku: "PROD-DOCK-007", type: "IN", quantity: 25, note: "Stock inicial" },
    { sku: "PROD-DOCK-007", type: "OUT", quantity: 10, note: "Salida tecnica" },
  ];

  await prisma.stockMovement.createMany({
    data: sampleMovements.flatMap((movement) => {
      const product = productBySku.get(movement.sku);
      if (!product) {
        return [];
      }

      return [
        {
          productId: product.id,
          type: movement.type,
          quantity: movement.quantity,
          note: movement.note,
        },
      ];
    }),
  });

  const sampleDraftSalesOrders = [
    {
      customerEmail: "acme@example.com",
      notes: "Pedido inicial para oficina central",
      lines: [
        { sku: "PROD-LAP-001", quantity: 2 },
        { sku: "PROD-MON-002", quantity: 4 },
      ],
    },
    {
      customerEmail: "globex@example.com",
      notes: "Renovacion de equipos comerciales",
      lines: [
        { sku: "PROD-KEY-003", quantity: 10 },
        { sku: "PROD-MOU-004", quantity: 10 },
        { sku: "PROD-WEB-006", quantity: 5 },
      ],
    },
    {
      customerEmail: "initech@example.com",
      notes: "Pedido piloto en estado draft",
      lines: [
        { sku: "PROD-CHA-005", quantity: 3 },
        { sku: "PROD-DOCK-007", quantity: 2 },
      ],
    },
  ];

  for (const order of sampleDraftSalesOrders) {
    const customerId = customerIdByEmail.get(order.customerEmail);
    if (!customerId) {
      continue;
    }

    const lines = order.lines.flatMap((line) => {
      const product = productBySku.get(line.sku);
      if (!product) {
        return [];
      }

      const unitPrice = Number(product.price.toString());
      const lineTotal = roundMoney(line.quantity * unitPrice);

      return [
        {
          productId: product.id,
          quantity: line.quantity,
          unitPrice,
          lineTotal,
        },
      ];
    });

    if (lines.length === 0) {
      continue;
    }

    const subtotal = roundMoney(lines.reduce((acc, line) => acc + line.lineTotal, 0));
    const tax = roundMoney(subtotal * SALES_TAX_RATE);
    const total = roundMoney(subtotal + tax);

    await prisma.salesOrder.create({
      data: {
        customerId,
        status: "DRAFT",
        currency: "EUR",
        notes: order.notes,
        subtotal,
        tax,
        total,
        lines: {
          createMany: {
            data: lines,
          },
        },
      },
    });
  }

  const [productCount, movementCount, salesOrderCount] = await Promise.all([
    prisma.product.count(),
    prisma.stockMovement.count(),
    prisma.salesOrder.count(),
  ]);
  console.log(
    `Seed ready. Products: ${productCount}. Stock movements: ${movementCount}. Draft sales orders: ${salesOrderCount}.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
