"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),

  address: z.string().min(5, "Address is required"),
  address2: z.string().optional(),

  city: z.string().min(2, "City is required"),
  state: z.string().optional(),

  zip: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

export type CheckoutState = {
  error?: string;
};

export async function checkoutAction(
  _previousState: CheckoutState | null,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  /*
   * Validate checkout form
   */
  const parsed = checkoutSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),

    address: formData.get("address"),
    address2: formData.get("address2") || undefined,

    city: formData.get("city"),
    state: formData.get("state") || undefined,

    zip: formData.get("zip"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Invalid information",
    };
  }

  const data = parsed.data;

  /*
   * Get current cart
   */
  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return {
      error: "Your cart is empty.",
    };
  }

  /*
   * Validate products before starting transaction
   */
  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE") {
      return {
        error: `${item.product.name} is no longer available.`,
      };
    }

    if (item.quantity < 1) {
      return {
        error: `Invalid quantity for ${item.product.name}.`,
      };
    }

    if (item.quantity > item.product.stock) {
      return {
        error: `${item.product.name} only has ${item.product.stock} item(s) left in stock.`,
      };
    }
  }

  /*
   * Calculate subtotal from database prices
   */
  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.product.price);

    return sum + price * item.quantity;
  }, 0);

  /*
   * Current shipping system
   *
   * Shipping can be calculated here later
   * when shipping methods are enabled.
   */
  const shipping = 0;

  const discount = 0;

  const total =
    subtotal -
    discount +
    shipping;

  if (total < 0) {
    return {
      error: "Invalid order total.",
    };
  }

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        /*
         * IMPORTANT:
         *
         * Stock is decremented atomically.
         *
         * Example:
         *
         * stock = 1
         * quantity = 1
         *
         * UPDATE product
         * SET stock = stock - 1
         * WHERE id = ... AND stock >= 1
         *
         * If another checkout already took the
         * last item, updateMany() returns count = 0.
         */

        for (const item of cart.items) {
          const result =
            await tx.product.updateMany({
              where: {
                id: item.productId,

                // Product must still be active
                status: "ACTIVE",

                // Critical atomic stock condition
                stock: {
                  gte: item.quantity,
                },
              },

              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          /*
           * count === 0 means:
           *
           * - product disappeared
           * - product is no longer ACTIVE
           * - stock was insufficient
           *
           * Throwing here causes the entire
           * transaction to rollback.
           */
          if (result.count !== 1) {
            throw new Error(
              `INSUFFICIENT_STOCK:${item.productId}`
            );
          }
        }

        /*
         * Create order
         */
        const createdOrder =
          await tx.order.create({
            data: {
              userId: session.user.id,

              status: "PENDING",

              subtotal,
              discount,
              shipping,
              total,

              currency: "THB",

              paymentStatus: "PENDING",
              paymentMethod: null,

              shippingFirstName:
                data.firstName,

              shippingLastName:
                data.lastName,

              shippingPhone:
                data.phone,

              shippingAddress1:
                data.address,

              shippingAddress2:
                data.address2,

              shippingCity:
                data.city,

              shippingState:
                data.state,

              shippingPostalCode:
                data.zip,

              shippingCountry:
                data.country,

              /*
               * Create order items using
               * the database price and SKU.
               */
              items: {
                create: cart.items.map(
                  (item) => {
                    const price =
                      Number(item.product.price);

                    const itemSubtotal =
                      price * item.quantity;

                    return {
                      productId:
                        item.productId,

                      productName:
                        item.product.name,

                      sku:
                        item.product.sku,

                      price,

                      quantity:
                        item.quantity,

                      subtotal:
                        itemSubtotal,
                    };
                  }
                ),
              },
            },
          });

        /*
         * Clear cart only after:
         *
         * 1. Stock successfully decremented
         * 2. Order successfully created
         *
         * If anything above fails,
         * transaction rolls everything back.
         */
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        });

        return createdOrder;
      },
      {
        /*
         * Checkout can involve multiple
         * product updates, so give the
         * transaction enough time.
         */
        timeout: 10000,
      }
    );

    /*
     * Revalidate affected pages
     */
    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath("/account");
    revalidatePath("/account/orders");
    revalidatePath(
      `/account/orders/${order.id}`
    );
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");

    /*
     * Go to success page
     */
    redirect(
      `/checkout/success?order=${order.id}`
    );
  } catch (error) {
    /*
     * Known stock failure
     */
    if (
      error instanceof Error &&
      error.message.startsWith(
        "INSUFFICIENT_STOCK:"
      )
    ) {
      return {
        error:
          "Sorry, one or more products are no longer available in the requested quantity. Please review your cart and try again.",
      };
    }

    /*
     * Unknown database / transaction error
     */
    console.error(
      "Checkout transaction failed:",
      error
    );

    return {
      error:
        "Unable to complete checkout. Please try again.",
    };
  }
}