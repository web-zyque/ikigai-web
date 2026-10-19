import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsList from "@/components/store/ProductsList";

export const metadata: Metadata = {
  title: "Products — Ikigai Accessories",
  description:
    "Browse our full range of premium car parts, tires, wheels and accessories.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    q?: string;
    brand?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? "";
  const searchQuery = params.search ?? params.q ?? "";
  const activeBrand = params.brand ?? "";

  return (
    <div className="min-h-screen bg-black">
      <Suspense>
        <ProductsList
          initialCategory={activeCategory}
          initialSearch={searchQuery}
          initialBrand={activeBrand}
        />
      </Suspense>
    </div>
  );
}
