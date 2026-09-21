import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
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
          product: true,
        },
      },
    },
  });

  const items = cart?.items ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotal = items.reduce((total, item) => {
    return (
      total +
      Number(item.product.price) * item.quantity
    );
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your shipping information to complete
          your order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <CheckoutForm
          defaultName={session.user.name ?? ""}
          defaultEmail={session.user.email ?? ""}
        />

        <aside className="h-fit rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-5">
            {items.map((item) => {
              const price = Number(item.product.price);

              return (
                <div
                  key={item.id}
                  className="flex gap-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.quantity} × $
                      {price.toFixed(2)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    $
                    {(price * item.quantity).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 border-t pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Shipping
              </span>

              <span>Free</span>
            </div>

            <div className="flex justify-between border-t pt-4 text-base font-bold">
              <span>Total</span>

              <span>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}