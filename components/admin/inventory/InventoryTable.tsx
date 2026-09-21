"use client";

import { useState, useTransition } from "react";
import {
  adjustStock,
  removeStock,
} from "@/actions/admin/inventory";

type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  category: {
    name: string;
  };
  images: {
    url: string;
  }[];
};

export default function InventoryTable({
  products,
}: {
  products: Product[];
}) {
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
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
              {products.map((product) => {
                const outOfStock =
                  product.stock === 0;

                const lowStock =
                  product.stock > 0 &&
                  product.stock <= 5;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <span className="font-medium">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.sku}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.category.name}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {product.stock}
                        </span>

                        {outOfStock && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                            Out
                          </span>
                        )}

                        {lowStock && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {product.status}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProduct(product)
                        }
                        className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                      >
                        Adjust stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <StockModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

function StockModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleRestock(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await adjustStock(
          product.id,
          formData
        );

        onClose();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to update stock."
        );
      }
    });
  }

  function handleRemove(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await removeStock(
          product.id,
          formData
        );

        onClose();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to update stock."
        );
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Adjust stock
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {product.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Current stock
          </p>

          <p className="mt-1 text-3xl font-bold">
            {product.stock}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <form action={handleRestock}>
            <input
              type="hidden"
              name="type"
              value="RESTOCK"
            />

            <label className="mb-2 block text-sm font-medium">
              Add stock
            </label>

            <div className="flex gap-2">
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                required
                placeholder="Quantity"
                className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <input
              name="reason"
              placeholder="Reason (optional)"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
            />
          </form>

          <form action={handleRemove}>
            <label className="mb-2 block text-sm font-medium">
              Remove stock
            </label>

            <div className="flex gap-2">
              <input
                name="quantity"
                type="number"
                min="1"
                max={product.stock}
                step="1"
                required
                placeholder="Quantity"
                className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={
                  pending || product.stock === 0
                }
                className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            </div>

            <input
              name="reason"
              placeholder="Reason (optional)"
              className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
            />
          </form>
        </div>
      </div>
    </div>
  );
}