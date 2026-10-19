"use client";

import React, { useState, useMemo } from "react";
import { useMobileMenu } from "@/app/admin/layout";
import { Package, Menu, Plus } from "lucide-react";
import { useProducts, useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { InventoryProduct } from "@/components/admin/ProductsInventoryTable";
import ProductSummaryCards, { ProductCounts } from "@/components/admin/ProductSummaryCards";
import ProductsTable from "@/components/admin/ProductsTable";
import AddProductModal from "@/components/admin/AddProductModal";
import ProductDetailsModal from "@/components/admin/ProductDetailsModal";
import { ProductResponse } from "@/types/products.types";

export default function ProductsInventoryPage() {
  const { setMobileOpen } = useMobileMenu();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: productsData, isLoading, refetch } = useProducts({
    limit: 100,
  });

  const { data: selectedApiProduct } = useProduct(selectedProductId || "");

  const selectedProduct: ProductResponse | null = useMemo(() => {
    if (!selectedProductId) return null;
    if (selectedApiProduct) return selectedApiProduct;
    if (productsData?.products) {
      const match = productsData.products.find((p) => p.id === selectedProductId);
      if (match) return match;
    }
    return null;
  }, [selectedProductId, selectedApiProduct, productsData]);

  const productsList: InventoryProduct[] = useMemo(() => {
    return (
      productsData?.products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || "Uncategorized",
        sku: product.sku,
        price: `₹${parseFloat(product.sellingPrice).toFixed(2)}`,
        stock: product.stockQuantity,
        status:
          product.inventoryStatus === "in_stock"
            ? "In Stock"
            : product.inventoryStatus === "low_stock"
            ? "Low Stock"
            : "Out of Stock",
        image: product.images?.[0]?.imageUrl,
        updatedAt: product.updatedAt || product.createdAt,
      })) || []
    );
  }, [productsData]);

  const counts: ProductCounts = useMemo(() => {
    return {
      total: productsList.length,
      inStock: productsList.filter((p) => p.status === "In Stock").length,
      lowStock: productsList.filter((p) => p.status === "Low Stock").length,
      outOfStock: productsList.filter((p) => p.status === "Out of Stock").length,
    };
  }, [productsList]);

  const handleStatusCardClick = (
    type: "All" | "in_stock" | "low_stock" | "out_of_stock"
  ) => {
    switch (type) {
      case "in_stock":
        setStatusFilter("In Stock");
        break;
      case "low_stock":
        setStatusFilter("Low Stock");
        break;
      case "out_of_stock":
        setStatusFilter("Out of Stock");
        break;
      case "All":
      default:
        setStatusFilter("All");
        break;
    }
  };

  const activeCardType: "All" | "in_stock" | "low_stock" | "out_of_stock" =
    statusFilter === "In Stock"
      ? "in_stock"
      : statusFilter === "Low Stock"
      ? "low_stock"
      : statusFilter === "Out of Stock"
      ? "out_of_stock"
      : "All";

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleAddStock = (prod: ProductResponse, additionalStock: number) => {
    updateProductMutation.mutate({
      id: prod.id,
      data: {
        stockQuantity: prod.stockQuantity + additionalStock,
      },
    });
  };

  const handleArchiveProduct = (prod: ProductResponse) => {
    updateProductMutation.mutate({
      id: prod.id,
      data: {
        publicationStatus: "draft",
      },
    });
  };

  const handleDeleteProduct = (prod: ProductResponse) => {
    deleteProductMutation.mutate(prod.id, {
      onSuccess: () => {
        setSelectedProductId(null);
      },
    });
  };

  const handleEditProduct = (prod: ProductResponse) => {
    // TODO: Implement edit product modal or navigate to edit page
    // For now, show a notification that this feature is coming soon
    alert(`Edit functionality for "${prod.name}" is not yet implemented. This will be added in a future update.`);
  };

  const handleAddProductSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-4 lg:px-8 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60 text-xs">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 max-w-7xl w-full flex flex-col justify-start">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
              Products
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        <ProductSummaryCards
          counts={counts}
          selectedStatus={activeCardType}
          onStatusClick={handleStatusCardClick}
        />

        <ProductsTable
          products={productsList}
          onViewProduct={(id) => setSelectedProductId(id)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </main>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      <ProductDetailsModal
        product={selectedProduct}
        isOpen={Boolean(selectedProductId && selectedProduct)}
        onClose={() => setSelectedProductId(null)}
        onEdit={handleEditProduct}
        onAddStock={handleAddStock}
        onArchive={handleArchiveProduct}
        onDelete={handleDeleteProduct}
      />
    </>
  );
}