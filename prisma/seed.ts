import "dotenv/config"; // 👈 1. อ่านไฟล์ .env อัตโนมัติ (แก้ ECONNREFUSED)
import bcrypt from "bcryptjs";

// 👈 2. เติม ProductStatus เข้ามาใน Import
import { PrismaClient, ProductStatus } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. สร้าง Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. สร้าง Driver Adapter
const adapter = new PrismaPg(pool);

// 3. ส่ง Adapter ให้ Prisma Client
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Seeding database...");

  const adminPasswordHash = await bcrypt.hash(
    "Admin123!",
    12
  );

  await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "Admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const electronics = await prisma.category.upsert({
    where: {
      slug: "electronics",
    },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic products and accessories.",
    },
  });

  const clothing = await prisma.category.upsert({
    where: {
      slug: "clothing",
    },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Clothing and fashion.",
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "HEADPHONE-001",
    },
    update: {},
    create: {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      sku: "HEADPHONE-001",
      description:
        "Premium wireless headphones with active noise cancellation.",
      price: 2990,
      compareAtPrice: 3490,
      stock: 25,
      status: ProductStatus.ACTIVE,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "KEYBOARD-001",
    },
    update: {},
    create: {
      name: "Mechanical Keyboard",
      slug: "mechanical-keyboard",
      sku: "KEYBOARD-001",
      description:
        "Mechanical keyboard designed for productivity and gaming.",
      price: 2490,
      stock: 18,
      status: ProductStatus.ACTIVE,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: {
      sku: "TSHIRT-001",
    },
    update: {},
    create: {
      name: "Premium T-Shirt",
      slug: "premium-t-shirt",
      sku: "TSHIRT-001",
      description: "Minimal premium cotton T-shirt.",
      price: 790,
      compareAtPrice: 990,
      stock: 50,
      status: ProductStatus.ACTIVE,
      categoryId: clothing.id,
    },
  });

  console.log("Database seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // 👈 3. ปิด Connection Pool เพื่อให้ Process จบการทำงานสมบูรณ์
  });