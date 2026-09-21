import Link from "next/link";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: unknown;
  compareAtPrice: unknown;
  stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  categoryId: string;
};

export default function ProductForm({
  product,
  categories,
  action,
}: {
  product?: Product;
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Basic information
        </h2>

        <div className="mt-5 grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product name
            </label>

            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              SKU
            </label>

            <input
              name="sku"
              required
              defaultValue={product?.sku ?? ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="SKU-001"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              name="description"
              rows={6}
              defaultValue={product?.description ?? ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              placeholder="Product description..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Pricing & inventory
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Price
            </label>

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={
                product ? String(product.price) : ""
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Compare at price
            </label>

            <input
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                product?.compareAtPrice != null
                  ? String(product.compareAtPrice)
                  : ""
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock
            </label>

            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product?.stock ?? 0}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Organization
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              defaultValue={product?.status ?? "DRAFT"}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border px-5 py-3 text-sm font-medium"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}