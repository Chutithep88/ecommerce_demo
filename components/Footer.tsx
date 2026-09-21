import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-gray-950"
            >
              ECOMMERCE
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
              A simple and modern shopping experience built with Next.js.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-950">
              Shop
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  All Products
                </Link>
              </li>

              <li>
                <Link
                  href="/categories"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  href="/cart"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-950">
              Account
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/account"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  My Account
                </Link>
              </li>

              <li>
                <Link
                  href="/account/orders"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  Orders
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold text-gray-950">
              Help
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-gray-500">
                  Shipping
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Returns
                </span>
              </li>

              <li>
                <span className="text-sm text-gray-500">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ECOMMERCE. All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-black"
            >
              Privacy
            </Link>

            <Link
              href="#"
              className="text-xs text-gray-500 hover:text-black"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}