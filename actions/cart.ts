"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}

/**
 * Add product to cart
 */
export async function addToCart(productId: string) {
  const userId = await getUserId();

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.status !== "ACTIVE") {
    throw new Error("This product is not available");
  }

  if (product.stock <= 0) {
    throw new Error("This product is out of stock");
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + 1;

    if (newQuantity > product.stock) {
      throw new Error(
        `Only ${product.stock} item(s) available`
      );
    }

    await prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: 1,
      },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/products");
  revalidatePath("/", "layout");
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartItemId: string,
  quantity: number
) {
  const userId = await getUserId();

  if (!Number.isInteger(quantity)) {
    throw new Error("Invalid quantity");
  }

  if (quantity < 1) {
    return removeCartItem(cartItemId);
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
    include: {
      product: true,
    },
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  if (item.product.status !== "ACTIVE") {
    throw new Error(
      "This product is no longer available"
    );
  }

  if (item.product.stock <= 0) {
    throw new Error("This product is out of stock");
  }

  if (quantity > item.product.stock) {
    throw new Error(
      `Only ${item.product.stock} item(s) available`
    );
  }

  await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

/**
 * Remove item from cart
 */
export async function removeCartItem(
  cartItemId: string
) {
  const userId = await getUserId();

  const item = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cart: {
        userId,
      },
    },
  });

  if (!item) {
    throw new Error("Cart item not found");
  }

  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  const userId = await getUserId();

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}