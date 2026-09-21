import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import OrderTable from "@/components/admin/orders/OrderTable";

type SearchParams = {
  status?: string;
  payment?: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  const validPayments = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];

  const status = validStatuses.includes(params.status || "")
    ? params.status
    : undefined;

  const payment = validPayments.includes(params.payment || "")
    ? params.payment
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status
        ? {
            status: status as never,
          }
        : {}),

      ...(payment
        ? {
            paymentStatus: payment as never,
          }
        : {}),
    },

    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },

      items: {
        select: {
          quantity: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const allOrders = await prisma.order.count();

  const pendingOrders = await prisma.order.count({
    where: {
      status: "PENDING",
    },
  });

  const paidOrders = await prisma.order.count({
    where: {
      paymentStatus: "PAID",
    },
  });

  const cancelledOrders = await prisma.order.count({
    where: {
      status: "CANCELLED",
    },
  });

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer orders and payments.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="All Orders"
          value={allOrders}
        />

        <StatCard
          title="Pending"
          value={pendingOrders}
        />

        <StatCard
          title="Paid"
          value={paidOrders}
        />

        <StatCard
          title="Cancelled"
          value={cancelledOrders}
        />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap gap-2">
          <FilterLink
            href="/admin/orders"
            active={!status}
          >
            All
          </FilterLink>

          {validStatuses.map((item) => (
            <FilterLink
              key={item}
              href={`/admin/orders?status=${item}${
                payment
                  ? `&payment=${payment}`
                  : ""
              }`}
              active={status === item}
            >
              {item}
            </FilterLink>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
          {validPayments.map((item) => (
            <FilterLink
              key={item}
              href={`/admin/orders?payment=${item}${
                status
                  ? `&status=${status}`
                  : ""
              }`}
              active={payment === item}
            >
              Payment: {item}
            </FilterLink>
          ))}
        </div>
      </div>

      <OrderTable orders={orders} />
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${
        active
          ? "bg-black text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  );
}