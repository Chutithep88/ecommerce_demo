import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import PayNowButton from "@/components/PayNowButton";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const canPay =
    order.paymentStatus === "PENDING" &&
    order.status === "PENDING";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* HEADER */}

      <div className="mb-8">
        <Link
          href="/account/orders"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Orders
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>

            <p className="mt-2 text-gray-500">
              Placed on{" "}
              {new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(order.createdAt)}
            </p>
          </div>

          <OrderStatus status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* ORDER ITEMS */}

          <section className="rounded-2xl border bg-white">
            <div className="border-b px-6 py-5">
              <h2 className="font-semibold">
                Order Items
              </h2>
            </div>

            <div className="divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-5 px-6 py-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium">
                      {item.productName}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ฿{Number(item.price).toFixed(2)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 font-semibold">
                    ฿{Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SHIPPING */}

          <section className="rounded-2xl border bg-white">
            <div className="border-b px-6 py-5">
              <h2 className="font-semibold">
                Shipping Information
              </h2>
            </div>

            <div className="space-y-2 px-6 py-5 text-sm">
              <p className="font-medium">
                {order.shippingFirstName}{" "}
                {order.shippingLastName}
              </p>

              <p className="text-gray-600">
                {order.shippingPhone}
              </p>

              <div className="pt-3 text-gray-600">
                <p>{order.shippingAddress1}</p>

                {order.shippingAddress2 && (
                  <p>{order.shippingAddress2}</p>
                )}

                <p>
                  {order.shippingCity}
                  {order.shippingState
                    ? `, ${order.shippingState}`
                    : ""}
                  {order.shippingPostalCode
                    ? ` ${order.shippingPostalCode}`
                    : ""}
                </p>

                <p>{order.shippingCountry}</p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <aside>
          <section className="sticky top-6 rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold">
              Order Summary
            </h2>

            {/* PAYMENT */}

            <div className="mt-6 rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Payment
                </span>

                <PaymentStatus
                  status={order.paymentStatus}
                />
              </div>

              {order.paymentMethod && (
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-500">
                    Method
                  </span>

                  <span className="font-medium">
                    {order.paymentMethod}
                  </span>
                </div>
              )}

              {/* PAY NOW */}

              {canPay && (
                <div className="mt-5 border-t pt-5">
                  <p className="mb-3 text-sm text-gray-500">
                    Your order is waiting for payment.
                  </p>

                  <PayNowButton orderId={order.id} />
                </div>
              )}

              {order.paymentStatus === "PAID" && (
                <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                  Payment completed successfully.
                </div>
              )}

              {order.paymentStatus === "FAILED" && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  Payment failed. Please try again.
                </div>
              )}

              {order.paymentStatus === "REFUNDED" && (
                <div className="mt-4 rounded-lg bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  This payment has been refunded.
                </div>
              )}
            </div>

            {/* PRICE */}

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span>
                  ฿{Number(order.subtotal).toFixed(2)}
                </span>
              </div>

              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="text-green-600">
                    -฿{Number(order.discount).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Shipping
                </span>

                <span>
                  {Number(order.shipping) === 0
                    ? "Free"
                    : `฿${Number(order.shipping).toFixed(2)}`}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    ฿{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER STATUS */}

            <div className="mt-6 border-t pt-6">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Order Status
              </p>

              <p className="mt-2 font-medium">
                {formatStatus(order.status)}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function OrderStatus({
  status,
}: {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
}) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function PaymentStatus({
  status,
}: {
  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";
}) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}