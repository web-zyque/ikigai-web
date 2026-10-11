"use client";

import React, { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useProduct } from "@/hooks/use-products";
import ProductDetailsModal from "@/components/admin/ProductDetailsModal";
import { DEMO_PRODUCTS_BY_ID } from "@/data/demoProducts";
import { GetProductsResponse, ProductResponse } from "@/types/products.types";
import ProductsInventoryPage from "../page";

function ProductDetailsRouteContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const productId = (params?.id as string) || "";
  const search = searchParams?.get("search") || null;

  const backUrl = search
    ? `/admin/products?search=${encodeURIComponent(search)}`
    : "/admin/products";

  // 1. Check if product already exists in React Query cache
  const cachedProducts = queryClient.getQueryData<GetProductsResponse>([
    "products",
    { limit: 100 },
  ]);
  const cachedProduct = cachedProducts?.products.find((p) => p.id === productId);

  // 2. Check demo products map
  const demoProduct = DEMO_PRODUCTS_BY_ID[productId] || null;

  // 3. Connect to backend API via useProduct hook
  const { data: apiProduct } = useProduct(productId);

  const product: ProductResponse | null =
    apiProduct || cachedProduct || demoProduct || null;

  return (
    <>
      <ProductsInventoryPage />
      <ProductDetailsModal
        product={product}
        isOpen={true}
        onClose={() => router.push(backUrl)}
      />
    </>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
            <p className="text-white/60 text-xs">Loading product details...</p>
          </div>
        </div>
      }
    >
      <ProductDetailsRouteContent />
    </Suspense>
  );
}
