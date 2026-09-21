import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="text-sm font-medium text-gray-500">
          Browse
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
          Categories
        </h1>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-gray-500">
            No categories available.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group rounded-xl border border-gray-200 p-6 transition hover:border-gray-400 hover:shadow-sm"
            >
              <h2 className="font-semibold text-gray-950 group-hover:underline">
                {category.name}
              </h2>

              {category.description && (
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>
              )}

              <p className="mt-5 text-xs font-medium text-gray-400">
                {category._count.products} products
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}