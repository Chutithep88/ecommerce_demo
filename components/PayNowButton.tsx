"use client";

import { useTransition } from "react";
import { payOrderAction } from "@/actions/payment";

type Props = {
  orderId: string;
};

export default function PayNowButton({
  orderId,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handlePay() {
    startTransition(async () => {
      await payOrderAction(orderId);
    });
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={pending}
      className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Processing payment..." : "Pay Now"}
    </button>
  );
}