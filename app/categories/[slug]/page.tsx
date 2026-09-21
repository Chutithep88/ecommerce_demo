import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (!category) {
    return {
      title: "Category not found",
    };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Browse ${category.name} products.`,
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    include: {
      products: {
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
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black"
      >
        <ChevronLeft size={16} />
        All categories
      </Link>

      <div className="mt-8 border-b border-gray-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
          Category
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-950">
          {category.name}
        </h1>

        {category.description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            {category.description}
          </p>
        )}

        <p className="mt-4 text-sm text-gray-400">
          {category.products.length} products
        </p>
      </div>

      <section className="py-10">
        {category.products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
            <h2 className="font-semibold text-gray-950">
              No products in this category
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Check back later for new products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((product) => (
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