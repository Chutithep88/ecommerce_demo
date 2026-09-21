import { prisma } from "@/lib/prisma";

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  return cart;
}