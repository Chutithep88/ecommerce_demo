import Link from "next/link";

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  total: unknown;
  currency: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  items: {
    quantity: number;
  }[];
};

function statusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";

    case "SHIPPED":
      return "bg-blue-100 text-blue-700";

    case "PROCESSING":
      return "bg-purple-100 text-purple-700";

    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function paymentClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function OrderTable({
  orders,
}: {
  orders: Order[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left">
              <th className="px-5 py-4 font-semibold">
                Order
              </th>

              <th className="px-5 py-4 font-semibold">
                Customer
              </th>

              <th className="px-5 py-4 font-semibold">
                Items
              </th>

              <th className="px-5 py-4 font-semibold">
                Total
              </th>

              <th className="px-5 py-4 font-semibold">
                Payment
              </th>

              <th className="px-5 py-4 font-semibold">
                Status
              </th>

              <th className="px-5 py-4 font-semibold">
                Date
              </th>

              <th className="px-5 py-4" />
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <tr
                  key={order.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium">
                        {order.user.name || "Guest"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {order.user.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {itemCount}
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {Number(order.total).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}{" "}
                    {order.currency}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentClass(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="p-12 text-center text-sm text-gray-500">
          No orders found.
        </div>
      )}
    </div>
  );
}