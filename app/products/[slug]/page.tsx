import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      name: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.name,
    description:
      product.description ??
      `Buy ${product.name} online.`,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const price = Number(product.price);

  const compareAtPrice =
    product.compareAtPrice !== null
      ? Number(product.compareAtPrice)
      : null;

  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(
          ((compareAtPrice - price) / compareAtPrice) * 100
        )
      : null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black"
        >
          <ChevronLeft size={16} />
          Back to products
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={
                  product.images[0].alt ??
                  product.name
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.slice(0, 5).map((image) => (
                <div
                  key={image.id}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100"
                >
                  <img
                    src={image.url}
                    alt={image.alt ?? product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Information */}
        <div className="flex flex-col">
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-sm font-medium uppercase tracking-wide text-gray-400 hover:text-gray-700"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
            {product.name}
          </h1>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-2xl font-semibold text-gray-950">
              ฿{price.toLocaleString("th-TH")}
            </span>

            {compareAtPrice &&
              compareAtPrice > price && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ฿
                    {compareAtPrice.toLocaleString(
                      "th-TH"
                    )}
                  </span>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    Save {discount}%
                  </span>
                </>
              )}
          </div>

          <div className="mt-6 border-y border-gray-200 py-5">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />

                <span className="font-medium text-gray-900">
                  In stock
                </span>

                <span className="text-gray-400">
                  ({product.stock} available)
                </span>
              </div>
            ) : (
              <div className="text-sm font-medium text-red-600">
                Out of stock
              </div>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-950">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Cart */}
          <div className="mt-10">
            {product.stock > 0 ? (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <ShoppingBag size={18} />
                Add to cart
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-gray-200 px-6 py-4 text-sm font-semibold text-gray-400"
              >
                Out of stock
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-6 text-xs text-gray-500">
            <div>
              <span className="block font-medium text-gray-900">
                SKU
              </span>
              <span className="mt-1 block">
                {product.sku}
              </span>
            </div>

            <div>
              <span className="block font-medium text-gray-900">
                Category
              </span>
              <span className="mt-1 block">
                {product.category.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}