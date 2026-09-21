import { requireAdmin } from "@/lib/auth-guard";

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
        Administration
      </p>

      <h1 className="mt-2 text-3xl font-bold text-gray-950">
        Admin Dashboard
      </h1>

      <p className="mt-3 text-gray-500">
        Welcome, {user.name ?? user.email}.
      </p>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          Authentication is working.
        </p>

        <p className="mt-2 text-sm font-medium text-gray-900">
          Role: {user.role}
        </p>
      </div>
    </main>
  );
}