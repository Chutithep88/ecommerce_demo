"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    null
  );

  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
              <LogIn size={20} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-950">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to your account.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-900"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-900"
                >
                  Password
                </label>

                <span className="text-xs text-gray-400">
                  Minimum 8 characters
                </span>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?
            </p>

            <Link
              href="/register"
              className="mt-1 inline-block text-sm font-semibold text-gray-950 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}