import Link from "next/link";
import {
  ShoppingBag,
  UserRound,
  Search,
  Menu,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const session = await auth();

  let cartCount = 0;

  if (session?.user?.id) {
    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
    });

    cartCount =
      cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight text-gray-950"
          >
            ECOMMERCE
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 transition hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="text-sm font-medium text-gray-700 transition hover:text-black"
            >
              Shop
            </Link>

            <Link
              href="/categories"
              className="text-sm font-medium text-gray-700 transition hover:text-black"
            >
              Categories
            </Link>

            {
              session?.user?.role == "ADMIN" && (
                <>
                  <Link
                    href="/admin/products"
                    className="text-sm font-medium text-gray-700 transition hover:text-black"
                  >
                    Manage Products
                  </Link>

                  <Link
                    href="/admin/inventory"
                    className="text-sm font-medium text-gray-700 transition hover:text-black"
                  >
                    Manage Inventory
                  </Link>

                  <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-gray-700 transition hover:text-black"
                  >
                    Manage Orders
                  </Link>
                </>
              )
            }

          </nav>

          {/* Search */}
          <div className="hidden flex-1 md:block md:max-w-md">
            <form action="/products" method="GET">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  name="q"
                  placeholder="Search products..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
                />
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {session?.user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black sm:flex"
              >
                <UserRound size={18} />

                <span className="max-w-28 truncate">
                  {session.user.name ?? "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 hover:text-black"
              >
                <UserRound size={20} />
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 hover:text-black"
            >
              <ShoppingBag size={20} />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-3 md:hidden">
          <form action="/products" method="GET">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}