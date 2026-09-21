import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  updateProduct,
} from "@/actions/admin/products";
import ProductForm from "@/components/admin/products/ProductForm";
import ProductImageManager from "@/components/admin/products/ProductImageManager";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Edit product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update product information and images.
        </p>
      </div>

      <div className="space-y-6">
        <ProductForm
          product={product}
          categories={categories}
          action={updateProduct.bind(null, product.id)}
        />

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <ProductImageManager
            productId={product.id}
            images={product.images}
          />
        </div>
      </div>
    </main>
  );
}