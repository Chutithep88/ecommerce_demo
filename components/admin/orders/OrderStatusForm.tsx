"use client";

import { useState } from "react";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "@/actions/admin/orders";

type Props = {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
};

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const paymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export default function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleOrderStatusChange(
    value: (typeof orderStatuses)[number]
  ) {
    try {
      setLoading(true);
      setMessage("");

      await updateOrderStatus(orderId, value);

      setMessage("Order status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update order."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentStatusChange(
    value: (typeof paymentStatuses)[number]
  ) {
    try {
      setLoading(true);
      setMessage("");

      await updatePaymentStatus(orderId, value);

      setMessage("Payment status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update payment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Order Status
        </label>

        <select
          value={orderStatus}
          disabled={loading}
          onChange={(e) =>
            handleOrderStatusChange(
              e.target.value as (typeof orderStatuses)[number]
            )
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Payment Status
        </label>

        <select
          value={paymentStatus}
          disabled={loading}
          onChange={(e) =>
            handlePaymentStatusChange(
              e.target.value as (typeof paymentStatuses)[number]
            )
          }
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}