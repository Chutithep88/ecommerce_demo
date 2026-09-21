"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return session;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(name: string, productId?: string) {
  const baseSlug = makeSlug(name) || `product-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === productId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description =
    String(formData.get("description") || "").trim() || null;

  const categoryId = String(formData.get("categoryId") || "").trim();

  const price = Number(formData.get("price"));
  const compareAtPriceValue = String(
    formData.get("compareAtPrice") || ""
  ).trim();

  const compareAtPrice = compareAtPriceValue
    ? Number(compareAtPriceValue)
    : null;

  const stock = Number(formData.get("stock") || 0);
  const status = String(formData.get("status") || "DRAFT");

  if (!name) {
    throw new Error("Product name is required");
  }

  if (!sku) {
    throw new Error("SKU is required");
  }

  if (!categoryId) {
    throw new Error("Category is required");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid price");
  }

  if (
    compareAtPrice !== null &&
    (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
  ) {
    throw new Error("Invalid compare price");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Invalid stock");
  }

  if (!["ACTIVE", "DRAFT", "ARCHIVED"].includes(status)) {
    throw new Error("Invalid product status");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const existingSku = await prisma.product.findUnique({
    where: { sku },
    select: { id: true },
  });

  if (existingSku) {
    throw new Error("SKU already exists");
  }

  const slug = await uniqueSlug(name);

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      sku,
      price,
      compareAtPrice,
      stock,
      status: status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      categoryId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim();
  const description =
    String(formData.get("description") || "").trim() || null;

  const categoryId = String(formData.get("categoryId") || "").trim();

  const price = Number(formData.get("price"));

  const compareAtPriceValue = String(
    formData.get("compareAtPrice") || ""
  ).trim();

  const compareAtPrice = compareAtPriceValue
    ? Number(compareAtPriceValue)
    : null;

  const stock = Number(formData.get("stock") || 0);
  const status = String(formData.get("status") || "DRAFT");

  if (!name) throw new Error("Product name is required");
  if (!sku) throw new Error("SKU is required");
  if (!categoryId) throw new Error("Category is required");

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid price");
  }

  if (
    compareAtPrice !== null &&
    (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)
  ) {
    throw new Error("Invalid compare price");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Invalid stock");
  }

  if (!["ACTIVE", "DRAFT", "ARCHIVED"].includes(status)) {
    throw new Error("Invalid product status");
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const existingSku = await prisma.product.findUnique({
    where: { sku },
    select: { id: true },
  });

  if (existingSku && existingSku.id !== productId) {
    throw new Error("SKU already exists");
  }

  const slug = await uniqueSlug(name, productId);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description,
      sku,
      price,
      compareAtPrice,
      stock,
      status: status as "ACTIVE" | "DRAFT" | "ARCHIVED",
      categoryId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      orderItems: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // ไม่ลบ Product ที่มีประวัติ Order
  if (product.orderItems.length > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "ARCHIVED",
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return;
  }

  // ลบรูปจาก Blob
  for (const image of product.images) {
    try {
      await del(image.url);
    } catch {
      // ไม่ให้ Blob error ทำให้ DB operation ทั้งหมดล้ม
    }
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function uploadProductImage(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Image file is required");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Image must be smaller than 5MB");
  }

  const filename = `products/${productId}/${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const lastImage = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const position = lastImage ? lastImage.position + 1 : 0;

  await prisma.productImage.create({
    data: {
      productId,
      url: blob.url,
      alt: productId,
      position,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/products");
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  try {
    await del(image.url);
  } catch {
    // Continue deleting DB record
  }

  await prisma.productImage.delete({
    where: { id: imageId },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${image.productId}/edit`);
  revalidatePath("/products");
}

export async function moveProductImage(
  imageId: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  const target = await prisma.productImage.findFirst({
    where:
      direction === "up"
        ? {
            productId: image.productId,
            position: {
              lt: image.position,
            },
          }
        : {
            productId: image.productId,
            position: {
              gt: image.position,
            },
          },
    orderBy:
      direction === "up"
        ? { position: "desc" }
        : { position: "asc" },
  });

  if (!target) return;

  await prisma.$transaction([
    prisma.productImage.update({
      where: { id: image.id },
      data: { position: target.position },
    }),
    prisma.productImage.update({
      where: { id: target.id },
      data: { position: image.position },
    }),
  ]);

  revalidatePath(`/admin/products/${image.productId}/edit`);
  revalidatePath("/products");
}