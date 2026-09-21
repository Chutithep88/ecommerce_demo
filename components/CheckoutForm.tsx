"use client";

import { useActionState } from "react";
import { checkoutAction } from "@/actions/checkout";

type Props = {
  defaultName: string;
  defaultEmail: string;
};

export default function CheckoutForm({
  defaultName,
  defaultEmail,
}: Props) {
  const [state, formAction, pending] = useActionState(
    checkoutAction,
    null
  );

  // Try to split existing account name into first/last name
  const nameParts = defaultName.trim().split(/\s+/);

  const defaultFirstName = nameParts[0] ?? "";
  const defaultLastName =
    nameParts.length > 1
      ? nameParts.slice(1).join(" ")
      : "";

  return (
    <form
      action={formAction}
      className="rounded-2xl border bg-white p-6"
    >
      <h2 className="text-lg font-semibold">
        Shipping Information
      </h2>

      {state?.error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {/* FIRST NAME + LAST NAME */}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium"
            >
              First name
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={defaultFirstName}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="John"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium"
            >
              Last name
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={defaultLastName}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* EMAIL */}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="john@example.com"
          />
        </div>

        {/* PHONE */}

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="+66 81 234 5678"
          />
        </div>

        {/* ADDRESS */}

        <div>
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            name="address"
            required
            rows={4}
            className="w-full resize-none rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Street address"
          />
        </div>

        {/* ADDRESS 2 */}

        <div>
          <label
            htmlFor="address2"
            className="mb-2 block text-sm font-medium"
          >
            Apartment, suite, etc.
            <span className="ml-1 font-normal text-gray-400">
              (optional)
            </span>
          </label>

          <input
            id="address2"
            name="address2"
            type="text"
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Apartment, suite, unit, building"
          />
        </div>

        {/* CITY */}

        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium"
          >
            City
          </label>

          <input
            id="city"
            name="city"
            type="text"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
            placeholder="Bangkok"
          />
        </div>

        {/* STATE + ZIP */}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium"
            >
              State / Province
            </label>

            <input
              id="state"
              name="state"
              type="text"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="Province"
            />
          </div>

          <div>
            <label
              htmlFor="zip"
              className="mb-2 block text-sm font-medium"
            >
              ZIP / Postal code
            </label>

            <input
              id="zip"
              name="zip"
              type="text"
              required
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
              placeholder="10110"
            />
          </div>
        </div>

        {/* COUNTRY */}

        <div>
          <label
            htmlFor="country"
            className="mb-2 block text-sm font-medium"
          >
            Country
          </label>

          <input
            id="country"
            name="country"
            type="text"
            defaultValue="Thailand"
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
          />
        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Creating order..." : "Place order"}
        </button>
      </div>
    </form>
  );
}