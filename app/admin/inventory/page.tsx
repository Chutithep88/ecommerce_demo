import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import InventoryTable from "@/components/admin/inventory/InventoryTable";

export default async function AdminInventoryPage() {
    await requireAdmin();

    const products = await prisma.product.findMany({
        include: {
            category: true,
            images: {
                orderBy: {
                    position: "asc",
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });

    const serializedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price.toString(),
        compareAtPrice:
            product.compareAtPrice?.toString() ?? null,
        stock: product.stock,
        status: product.status,
        categoryId: product.categoryId,

        category: {
            id: product.category.id,
            name: product.category.name,
        },

        images: product.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            position: image.position,
        })),
    }));

    const totalProducts = products.length;

    const outOfStock = products.filter(
        (product) => product.stock === 0
    ).length;

    const lowStock = products.filter(
        (product) =>
            product.stock > 0 && product.stock <= 5
    ).length;

    const totalUnits = products.reduce(
        (sum, product) => sum + product.stock,
        0
    );

    return (
        <main className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Inventory
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage product stock and inventory levels.
                </p>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-4">
                <StatCard
                    label="Products"
                    value={totalProducts}
                />

                <StatCard
                    label="Total units"
                    value={totalUnits}
                />

                <StatCard
                    label="Low stock"
                    value={lowStock}
                />

                <StatCard
                    label="Out of stock"
                    value={outOfStock}
                />
            </div>

            <InventoryTable products={serializedProducts} />
        </main>
    );
}

function StatCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold">
                {value.toLocaleString()}
            </p>
        </div>
    );
}