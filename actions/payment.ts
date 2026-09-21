"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function payOrderAction(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.status === "CANCELLED") {
    throw new Error("Cancelled orders cannot be paid.");
  }

  if (order.paymentStatus === "PAID") {
    redirect(`/account/orders/${order.id}?payment=already-paid`);
  }

  if (order.paymentStatus === "REFUNDED") {
    throw new Error("This order has already been refunded.");
  }

  if (order.total.toNumber() <= 0) {
    throw new Error("Invalid order total.");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: {
        id: order.id,
        userId: session.user.id,
        paymentStatus: "PENDING",
        status: "PENDING",
      },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "STRIPE",
        status: "CONFIRMED",
        stripePaymentIntentId: `demo_${order.id}`,
      },
    });

    if (result.count !== 1) {
      throw new Error(
        "Payment could not be completed. The order may already be paid."
      );
    }

    return tx.order.findUniqueOrThrow({
      where: {
        id: order.id,
      },
    });
  });

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${updatedOrder.id}`);
  revalidatePath("/admin/orders");

  redirect(
    `/account/orders/${updatedOrder.id}?payment=success`
  );
}