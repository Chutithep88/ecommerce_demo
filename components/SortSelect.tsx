'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1'); // รีเซ็ตไปหน้าแรกเมื่อเปลี่ยนการเรียงลำดับ
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-500"
    >
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Name</option>
    </select>
  );
}