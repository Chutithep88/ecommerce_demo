import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
        take: 1,
      },
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
              New collection
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl">
              Everything you need.
              <br />
              Nothing you don&apos;t.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
              Discover carefully selected products with
              fast delivery and a simple shopping
              experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Shop products
              </Link>

              <Link
                href="/categories"
                className="rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Browse categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
              Featured collection
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
              Latest products
            </h2>
          </div>

          <Link
            href="/products"
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <h3 className="font-semibold text-gray-950">
              No products yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add products from the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}