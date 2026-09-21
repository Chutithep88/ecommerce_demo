import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { deleteProduct } from "@/actions/admin/products";

function formatPrice(value: unknown) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(Number(value));
}

function statusClass(status: string) {
  if (status === "ACTIVE") {
    return "bg-green-100 text-green-700";
  }

  if (status === "ARCHIVED") {
    return "bg-gray-100 text-gray-600";
  }

  return "bg-yellow-100 text-yellow-700";
}

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: {
          position: "asc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store products
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="font-semibold">
              No products yet
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create your first product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-medium">
                            {product.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            {product.images.length > 0
                              ? "Image available"
                              : "No image"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.category.name}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        <form
                          action={deleteProduct.bind(
                            null,
                            product.id
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}