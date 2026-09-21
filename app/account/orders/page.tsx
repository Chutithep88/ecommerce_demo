import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PayNowButton from "@/components/PayNowButton";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* HEADER */}

      <div className="mb-8">
        <Link
          href="/account"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to Account
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          My Orders
        </h1>

        <p className="mt-2 text-gray-500">
          View your order history and order details.
        </p>
      </div>

      {/* EMPTY */}

      {orders.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center">
          <h2 className="text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            Your orders will appear here after you place
            an order.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        /* ORDERS */

        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            const canPay =
              order.paymentStatus === "PENDING" &&
              order.status === "PENDING";

            return (
              <div
                key={order.id}
                className="rounded-2xl border bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* LEFT */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="font-semibold hover:underline"
                      >
                        Order #
                        {order.id
                          .slice(-8)
                          .toUpperCase()}
                      </Link>

                      <OrderStatus
                        status={order.status}
                      />

                      <PaymentStatus
                        status={order.paymentStatus}
                      />
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Intl.DateTimeFormat(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      ).format(order.createdAt)}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {itemCount}{" "}
                      {itemCount === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>

                  {/* RIGHT */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
                    {/* TOTAL */}

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        ฿
                        {Number(
                          order.total
                        ).toFixed(2)}
                      </p>
                    </div>

                    {/* PAY NOW */}

                    {canPay && (
                      <PayNowButton
                        orderId={order.id}
                      />
                    )}

                    {/* DETAILS */}

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="rounded-xl border px-5 py-3 text-center text-sm font-medium transition hover:border-black hover:bg-gray-50"
                    >
                      View details
                    </Link>
                  </div>
                </div>

                {/* PAYMENT MESSAGE */}

                {canPay && (
                  <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Payment required
                    </p>

                    <p className="mt-1 text-sm text-yellow-700">
                      Your order has been created.
                      Complete payment to confirm
                      your order.
                    </p>
                  </div>
                )}

                {order.paymentStatus ===
                  "PAID" && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-medium text-green-800">
                      Payment completed
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Your payment has been
                      received.
                    </p>
                  </div>
                )}

                {order.paymentStatus ===
                  "FAILED" && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-800">
                      Payment failed
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      Please try paying again.
                    </p>
                  </div>
                )}

                {order.paymentStatus ===
                  "REFUNDED" && (
                  <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                    <p className="text-sm font-medium text-purple-800">
                      Payment refunded
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
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
    PROCESSING:
      "bg-purple-100 text-purple-800",
    SHIPPED:
      "bg-indigo-100 text-indigo-800",
    DELIVERED:
      "bg-green-100 text-green-800",
    CANCELLED:
      "bg-red-100 text-red-800",
    REFUNDED:
      "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
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
    PENDING:
      "bg-yellow-100 text-yellow-800",
    PAID:
      "bg-green-100 text-green-800",
    FAILED:
      "bg-red-100 text-red-800",
    REFUNDED:
      "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      Payment: {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}