import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default async function AddressesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/account"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back to account
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Addresses
        </h1>

        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <MapPin
            size={32}
            className="mx-auto text-gray-400"
          />

          <h2 className="mt-5 font-semibold text-gray-950">
            No addresses yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your shipping addresses will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}