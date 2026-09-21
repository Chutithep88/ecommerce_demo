import Link from "next/link";

type ProductFiltersProps = {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  currentSearch: string;
  currentCategory: string;
  currentSort: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  currentInStock: string;
};

export default function ProductFilters({
  categories,
  currentSearch,
  currentCategory,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
}: ProductFiltersProps) {
  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="text-sm font-semibold text-gray-950">
          Search
        </h3>

        <form
          action="/products"
          method="GET"
          className="mt-3"
        >
          {currentCategory && (
            <input
              type="hidden"
              name="category"
              value={currentCategory}
            />
          )}

          {currentSort && (
            <input
              type="hidden"
              name="sort"
              value={currentSort}
            />
          )}

          <input
            type="search"
            name="q"
            defaultValue={currentSearch}
            placeholder="Search products..."
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-500"
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-gray-950">
          Categories
        </h3>

        <div className="mt-3 space-y-2">
          <Link
            href="/products"
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              !currentCategory
                ? "bg-black font-medium text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All products
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                currentCategory === category.slug
                  ? "bg-black font-medium text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold text-gray-950">
          Price
        </h3>

        <form
          action="/products"
          method="GET"
          className="mt-3 space-y-3"
        >
          {currentSearch && (
            <input
              type="hidden"
              name="q"
              value={currentSearch}
            />
          )}

          {currentCategory && (
            <input
              type="hidden"
              name="category"
              value={currentCategory}
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="min"
              min="0"
              placeholder="Min"
              defaultValue={currentMinPrice}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-500"
            />

            <input
              type="number"
              name="max"
              min="0"
              placeholder="Max"
              defaultValue={currentMaxPrice}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            Apply price
          </button>
        </form>
      </div>

      {/* Stock */}
      <div>
        <h3 className="text-sm font-semibold text-gray-950">
          Availability
        </h3>

        <div className="mt-3">
          <Link
            href="/products?stock=in-stock"
            className={`block rounded-lg px-3 py-2 text-sm transition ${
              currentInStock === "in-stock"
                ? "bg-black font-medium text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            In stock
          </Link>
        </div>
      </div>
    </aside>
  );
}