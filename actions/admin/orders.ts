"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  await requireAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid order status");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === status) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    /*
     * If cancelling/refunding an order,
     * restore stock only once.
     */
    const shouldRestoreStock =
      (status === "CANCELLED" || status === "REFUNDED") &&
      order.status !== "CANCELLED" &&
      order.status !== "REFUNDED";

    if (shouldRestoreStock) {
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) continue;

        const beforeStock = product.stock;
        const afterStock = beforeStock + item.quantity;

        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: afterStock,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: "CANCEL_RESTORE",
            quantity: item.quantity,
            beforeStock,
            afterStock,
            reason: `Order ${order.id} ${status.toLowerCase()}`,
          },
        });
      }
    }

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/products");
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus
) {
  await requireAdmin();

  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new Error("Invalid payment status");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}