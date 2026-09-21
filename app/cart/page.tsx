import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import {
  removeCartItem,
  updateCartItem,
} from "@/actions/cart";

export default async function CartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  position: "asc",
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const items = cart?.items ?? [];

  const subtotal = items.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity;
  }, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border bg-white text-center">
          <ShoppingBag className="mb-5 h-12 w-12 text-gray-400" />

          <h1 className="text-2xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add some products to your cart to get started.
          </p>

          <Link
            href="/products"
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Shopping Cart
        </h1>

        <p className="mt-2 text-gray-500">
          Review your items before checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ITEMS */}

        <div className="overflow-hidden rounded-2xl border bg-white">
          {items.map((item) => {
            const price = Number(item.product.price);
            const total = price * item.quantity;

            const image = item.product.images[0];

            const isOutOfStock = item.product.stock <= 0;
            const maxReached =
              item.quantity >= item.product.stock;

            return (
              <div
                key={item.id}
                className="flex gap-5 border-b p-5 last:border-b-0"
              >
                {/* IMAGE */}

                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {image ? (
                    <img
                      src={image.url}
                      alt={
                        image.alt ??
                        item.product.name
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* INFO */}

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {item.product.name}
                  </Link>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatPrice(price)}
                  </p>

                  {/* STOCK */}

                  <p
                    className={`mt-1 text-xs ${
                      isOutOfStock
                        ? "text-red-500"
                        : maxReached
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${item.product.stock} in stock`}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    {/* QUANTITY */}

                    <div className="flex items-center rounded-lg border">
                      {/* MINUS */}

                      <form
                        action={async () => {
                          "use server";

                          await updateCartItem(
                            item.id,
                            Math.max(
                              1,
                              item.quantity - 1
                            )
                          );
                        }}
                      >
                        <button
                          type="submit"
                          disabled={item.quantity <= 1}
                          className="flex h-9 w-9 items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </form>

                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      {/* PLUS */}

                      <form
                        action={async () => {
                          "use server";

                          if (
                            item.quantity <
                            item.product.stock
                          ) {
                            await updateCartItem(
                              item.id,
                              item.quantity + 1
                            );
                          }
                        }}
                      >
                        <button
                          type="submit"
                          disabled={
                            maxReached ||
                            isOutOfStock
                          }
                          className="flex h-9 w-9 items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </form>
                    </div>

                    {/* DELETE */}

                    <form
                      action={async () => {
                        "use server";

                        await removeCartItem(item.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                {/* TOTAL */}

                <div className="hidden text-right font-semibold sm:block">
                  {formatPrice(total)}
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}

        <aside className="h-fit rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            {/* SUBTOTAL */}

            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* SHIPPING */}

            <div className="flex justify-between">
              <span className="text-gray-500">
                Shipping
              </span>

              <span className="font-medium">
                Calculated at checkout
              </span>
            </div>

            {/* TOTAL */}

            <div className="border-t pt-4">
              <div className="flex justify-between text-base">
                <span className="font-semibold">
                  Total
                </span>

                <span className="font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* CHECKOUT */}

          <Link
            href="/checkout"
            className="mt-6 block rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Proceed to checkout
          </Link>

          {/* CONTINUE SHOPPING */}

          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-black"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}