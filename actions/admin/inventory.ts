"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}

export async function adjustStock(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const type = String(formData.get("type") || "");
  const quantity = Number(formData.get("quantity"));
  const reason =
    String(formData.get("reason") || "").trim() || null;

  if (!["RESTOCK", "ADJUSTMENT", "RETURN"].includes(type)) {
    throw new Error("Invalid stock adjustment type");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const beforeStock = product.stock;
    let afterStock = beforeStock;

    if (
      type === "RESTOCK" ||
      type === "RETURN"
    ) {
      afterStock = beforeStock + quantity;
    }

    if (type === "ADJUSTMENT") {
      afterStock = quantity;
    }

    if (afterStock < 0) {
      throw new Error("Stock cannot be negative");
    }

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: afterStock,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        type:
          type as
            | "RESTOCK"
            | "ADJUSTMENT"
            | "RETURN",
        quantity:
          type === "ADJUSTMENT"
            ? afterStock - beforeStock
            : quantity,
        beforeStock,
        afterStock,
        reason,
      },
    });

    return afterStock;
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return result;
}

export async function removeStock(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const quantity = Number(formData.get("quantity"));
  const reason =
    String(formData.get("reason") || "").trim() || null;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (quantity > product.stock) {
      throw new Error("Insufficient stock");
    }

    const beforeStock = product.stock;
    const afterStock = beforeStock - quantity;

    await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: afterStock,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        type: "ADJUSTMENT",
        quantity: -quantity,
        beforeStock,
        afterStock,
        reason,
      },
    });
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}