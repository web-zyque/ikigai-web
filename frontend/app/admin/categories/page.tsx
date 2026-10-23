"use client";

import React, { useState, useMemo } from "react";
import { Plus, Menu } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { useCategories, useProducts } from "@/hooks/use-products";
import CategoriesTable, { CategoryRowItem } from "@/components/admin/categories/CategoriesTable";
import AddCategoryModal from "@/components/admin/categories/AddCategoryModal";

export default function CategoriesPage() {
  const { setMobileOpen } = useMobileMenu();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: categoriesData, isLoading: isCategoriesLoading, refetch: refetchCategories } = useCategories();
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ limit: 100 });

  const categoriesList: CategoryRowItem[] = useMemo(() => {
    const countMap: Record<string, number> = {};

    if (productsData?.products) {
      for (const prod of productsData.products) {
        if (prod.category?.id) {
          countMap[prod.category.id] = (countMap[prod.category.id] || 0) + 1;
        }
      }
    }

    return (categoriesData || []).map((cat) => ({
      ...cat,
      productsCount: countMap[cat.id] || 0,
    }));
  }, [categoriesData, productsData]);

  const isLoading = isCategoriesLoading || isProductsLoading;

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 max-w-7xl w-full flex flex-col justify-start">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Categories</h1>
              <p className="text-xs text-white/60 mt-0.5">
                Manage the categories available in your store.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer self-start sm:self-auto sm:ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        <CategoriesTable
          categories={categoriesList}
          isLoading={isLoading}
          onAddCategory={() => setIsAddModalOpen(true)}
        />
      </main>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetchCategories()}
      />
    </>
  );
}
