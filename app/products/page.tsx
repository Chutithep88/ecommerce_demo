import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";

import SortSelect from '@/components/SortSelect';

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    min?: string;
    max?: string;
    stock?: string;
    page?: string;
  }>;
};

const PRODUCTS_PER_PAGE = 12;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "newest";
  const min = params.min ?? "";
  const max = params.max ?? "";
  const stock = params.stock ?? "";
  const page = Math.max(
    1,
    Number(params.page ?? "1") || 1
  );

  const minPrice = min ? Number(min) : undefined;
  const maxPrice = max ? Number(max) : undefined;

  const where = {
    status: "ACTIVE" as const,

    ...(q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              sku: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),

    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined
              ? { gte: minPrice }
              : {}),
            ...(maxPrice !== undefined
              ? { lte: maxPrice }
              : {}),
          },
        }
      : {}),

    ...(stock === "in-stock"
      ? {
          stock: {
            gt: 0,
          },
        }
      : {}),
  };

  const orderBy =
    sort === "price-low"
      ? { price: "asc" as const }
      : sort === "price-high"
        ? { price: "desc" as const }
        : sort === "name"
          ? { name: "asc" as const }
          : { createdAt: "desc" as const };

  const [products, totalProducts, categories] =
    await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: {
              position: "asc",
            },
            take: 1,
          },
          category: true,
        },
        orderBy,
        skip: (page - 1) * PRODUCTS_PER_PAGE,
        take: PRODUCTS_PER_PAGE,
      }),

      prisma.product.count({
        where,
      }),

      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / PRODUCTS_PER_PAGE)
  );

  const createPageUrl = (newPage: number) => {
    const search = new URLSearchParams();

    if (q) search.set("q", q);
    if (category) search.set("category", category);
    if (sort) search.set("sort", sort);
    if (min) search.set("min", min);
    if (max) search.set("max", max);
    if (stock) search.set("stock", stock);

    search.set("page", String(newPage));

    return `/products?${search.toString()}`;
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Heading */}
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
          Shop
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          All Products
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          {totalProducts}{" "}
          {totalProducts === 1 ? "product" : "products"} found
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Filters */}
        <ProductFilters
          categories={categories}
          currentSearch={q}
          currentCategory={category}
          currentSort={sort}
          currentMinPrice={min}
          currentMaxPrice={max}
          currentInStock={stock}
        />

        {/* Products */}
        <section>
          {/* Sort */}
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">
              {products.length} products on this page
            </p>


            <SortSelect currentSort={sort} />
            {/* <form action="/products" method="GET">
              {q && (
                <input
                  type="hidden"
                  name="q"
                  value={q}
                />
              )}

              {category && (
                <input
                  type="hidden"
                  name="category"
                  value={category}
                />
              )}

              {min && (
                <input
                  type="hidden"
                  name="min"
                  value={min}
                />
              )}

              {max && (
                <input
                  type="hidden"
                  name="max"
                  value={max}
                />
              )}

              {stock && (
                <input
                  type="hidden"
                  name="stock"
                  value={stock}
                />
              )}

              <select
                name="sort"
                defaultValue={sort}
                onChange={(event) => {
                  event.currentTarget.form?.submit();
                }}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-500"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name
                </option>
              </select>
            </form> */}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <h2 className="text-lg font-semibold text-gray-950">
                No products found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <a
                      href={createPageUrl(page - 1)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </a>
                  )}

                  <span className="px-4 text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages && (
                    <a
                      href={createPageUrl(page + 1)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}