import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import {
  UserRound,
  Package,
  MapPin,
  LogOut,
} from "lucide-react";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          My Account
        </h1>

        <p className="mt-3 text-gray-500">
          Welcome back, {session.user.name ?? "Customer"}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/account/orders"
          className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <Package
            size={22}
            className="text-gray-700"
          />

          <h2 className="mt-5 font-semibold text-gray-950">
            Orders
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            View your order history and order details.
          </p>
        </Link>

        <Link
          href="/account/addresses"
          className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-400 hover:shadow-sm"
        >
          <MapPin
            size={22}
            className="text-gray-700"
          />

          <h2 className="mt-5 font-semibold text-gray-950">
            Addresses
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage your shipping addresses.
          </p>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <UserRound
            size={22}
            className="text-gray-700"
          />

          <h2 className="mt-5 font-semibold text-gray-950">
            Profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {session.user.email}
          </p>

          <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
            {session.user.role}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-8">
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}