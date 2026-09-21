import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type Props = {
    searchParams: Promise<{
        order?: string;
    }>;
};

export default async function CheckoutSuccess({
    searchParams,
}: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const params = await searchParams;

    if (!params.order) {
        redirect("/account/orders");
    }

    const order = await prisma.order.findFirst({
        where: {
            id: params.order,
            userId: session.user.id,
        },
        include: {
            payment: true,
        }
    });

    if (!order) {
        redirect("/account/orders");
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-20">
            <div className="rounded-2xl border bg-white p-10 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

                <h1 className="mt-6 text-3xl font-bold">
                    Order placed successfully!
                </h1>

                <p className="mt-3 text-gray-500">
                    Your order has been created and is waiting for payment.
                </p>

                <div className="mx-auto mt-8 max-w-md rounded-xl bg-gray-50 p-5 text-left">
                    <div className="flex justify-between">
                        <span className="text-gray-500">
                            Order ID
                        </span>

                        <span className="font-medium">
                            #{order.id.slice(-8).toUpperCase()}
                        </span>
                    </div>

                    <div className="mt-3 flex justify-between">
                        <span className="text-gray-500">
                            Status
                        </span>

                        <span className="font-medium">
                            {order.status}
                        </span>

                        {order.payment?.status === "PENDING" && (
                            <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                                Your order is waiting for payment.
                                Open your order details to complete payment.
                            </div>
                        )}

                    </div>

                    <div className="mt-3 flex justify-between border-t pt-3">
                        <span className="font-medium">
                            Total
                        </span>

                        <span className="font-bold">
                            ${Number(order.total).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href={`/account/orders/${order.id}`}
                        className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                        View order
                    </Link>

                    <Link
                        href="/products"
                        className="rounded-xl border px-6 py-3 text-sm font-semibold hover:bg-gray-50"
                    >
                        Continue shopping
                    </Link>
                </div>
            </div>
        </main>
    );
}