import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { addToCart } from "@/actions/cart";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: unknown;
    compareAtPrice: unknown;
    stock: number;
    images: {
      url: string;
      alt: string | null;
    }[];
    category: {
      name: string;
      slug: string;
    };
  };
};

export default function ProductCard({
  product,
}: ProductCardProps) {
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
    <article className="group">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}

          {discount !== null && (
            <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              -{discount}%
            </span>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-900">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="pt-4">
        <Link href={`/categories/${product.category.slug}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 transition hover:text-gray-700">
            {product.category.name}
          </p>
        </Link>

        <Link href={`/products/${product.slug}`}>
          <h2 className="mt-1 font-medium text-gray-950 transition group-hover:underline">
            {product.name}
          </h2>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-gray-950">
            ฿{price.toLocaleString("th-TH")}
          </span>

          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ฿{compareAtPrice.toLocaleString("th-TH")}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of stock"}
          </span>

          <Link
            href={`/products/${product.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:border-black hover:bg-black hover:text-white"
            aria-label={`View ${product.name}`}
          >
            <ShoppingBag size={16} />
          </Link>
        </div>

        <form
          action={async () => {
            "use server";

            await addToCart(product.id);
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Add to cart
          </button>
        </form>
      </div>
    </article>
  );
}