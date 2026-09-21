import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createProduct } from "@/actions/admin/products";
import ProductForm from "@/components/admin/products/ProductForm";

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Add product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new product for your store.
        </p>
      </div>

      <ProductForm
        categories={categories}
        action={createProduct}
      />
    </main>
  );
}