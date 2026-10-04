import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/store/Navbar";
import ProductsList from "@/components/store/ProductsList";

export const metadata: Metadata = {
  title: "Products — Ikigai Accessories",
  description:
    "Browse our full range of premium car parts, tires, wheels and accessories.",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const activeCategory = params.category ?? "";

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Suspense>
        <ProductsList initialCategory={activeCategory} />
      </Suspense>
    </div>
  );
}
