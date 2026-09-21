import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

import OrderStatusForm from "@/components/admin/orders/OrderStatusForm";

function money(value: unknown, currency: string) {
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })} ${currency}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: {
      id,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Orders
        </Link>

        <div className="mt-3">
          <h1 className="text-2xl font-bold">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Customer */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Customer
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">
                  Name:
                </span>{" "}
                {order.user.name || "—"}
              </p>

              <p>
                <span className="font-medium">
                  Email:
                </span>{" "}
                {order.user.email}
              </p>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Shipping Address
            </h2>

            <div className="mt-4 text-sm leading-6">
              <p className="font-medium">
                {order.shippingFirstName}{" "}
                {order.shippingLastName}
              </p>

              <p>
                {order.shippingPhone}
              </p>

              <p className="mt-2">
                {order.shippingAddress1}
              </p>

              {order.shippingAddress2 && (
                <p>
                  {order.shippingAddress2}
                </p>
              )}

              <p>
                {order.shippingCity}
                {order.shippingState
                  ? `, ${order.shippingState}`
                  : ""}
              </p>

              <p>
                {order.shippingPostalCode}
              </p>

              <p>
                {order.shippingCountry}
              </p>
            </div>
          </section>

          {/* Items */}
          <section className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b p-6">
              <h2 className="text-lg font-semibold">
                Order Items
              </h2>
            </div>

            <div className="divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Qty: {item.quantity} ×{" "}
                      {money(
                        item.price,
                        order.currency
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    {money(
                      item.subtotal,
                      order.currency
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow
                label="Subtotal"
                value={money(
                  order.subtotal,
                  order.currency
                )}
              />

              <SummaryRow
                label="Discount"
                value={`-${money(
                  order.discount,
                  order.currency
                )}`}
              />

              <SummaryRow
                label="Shipping"
                value={money(
                  order.shipping,
                  order.currency
                )}
              />

              <div className="border-t pt-4">
                <SummaryRow
                  label="Total"
                  value={money(
                    order.total,
                    order.currency
                  )}
                  strong
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Status */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Order Management
            </h2>

            <div className="mt-5">
              <OrderStatusForm
                orderId={order.id}
                orderStatus={order.status}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Payment
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <InfoRow
                label="Status"
                value={order.paymentStatus}
              />

              <InfoRow
                label="Method"
                value={
                  order.paymentMethod || "—"
                }
              />

              <InfoRow
                label="Payment Intent"
                value={
                  order.stripePaymentIntentId ||
                  "—"
                }
              />
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong ? "text-lg font-bold" : ""
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="break-all font-medium">
        {value}
      </span>
    </div>
  );
}