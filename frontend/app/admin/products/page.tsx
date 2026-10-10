"use client";

import React, { useState } from "react";
import { useMobileMenu } from "@/app/admin/layout";
import InventorySummaryCards, {
  InventoryCardType,
  InventoryMetricCard,
} from "@/components/admin/InventorySummaryCards";
import ProductsInventoryTable, {
  InventoryProduct,
  InventoryStatus,
} from "@/components/admin/ProductsInventoryTable";
import AddProductModal from "@/components/admin/AddProductModal";
import { Package, CheckCircle2, AlertTriangle, AlertCircle, Menu } from "lucide-react";
import { useProducts } from "@/hooks/use-products";

export default function ProductsInventoryPage() {
  const { setMobileOpen } = useMobileMenu();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCardType | null>(null);

  const { data: productsData, isLoading, refetch } = useProducts({
    limit: 100,
  });

  const productsList: InventoryProduct[] = productsData?.products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category.name,
    sku: product.sku,
    price: `₹${parseFloat(product.sellingPrice).toFixed(2)}`,
    stock: product.stockQuantity,
    status: product.inventoryStatus === 'in_stock' ? 'In Stock' :
            product.inventoryStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'
  })) || [];

  const totalCount = productsList.length;
  const inStockCount = productsList.filter((p) => p.status === "In Stock").length;
  const lowStockCount = productsList.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = productsList.filter((p) => p.status === "Out of Stock").length;

  const dynamicCards: InventoryMetricCard[] = [
    {
      type: "total",
      title: "Total Products",
      value: totalCount,
      description: "",
      footer: "",
      icon: Package,
    },
    {
      type: "in_stock",
      title: "In Stock",
      value: inStockCount,
      description: "",
      footer: "",
      icon: CheckCircle2,
    },
    {
      type: "low_stock",
      title: "Low Stock",
      value: lowStockCount,
      description: "",
      footer: "",
      icon: AlertTriangle,
    },
    {
      type: "out_of_stock",
      title: "Out of Stock",
      value: outOfStockCount,
      description: "",
      footer: "",
      icon: AlertCircle,
    },
  ];

  const getFilteredProducts = () => {
    switch (selectedCategory) {
      case "in_stock":
        return productsList.filter((p) => p.status === "In Stock");
      case "low_stock":
        return productsList.filter((p) => p.status === "Low Stock");
      case "out_of_stock":
        return productsList.filter((p) => p.status === "Out of Stock");
      case "total":
      default:
        return productsList;
    }
  };

  const filteredProducts = getFilteredProducts();

  const getCategoryMeta = () => {
    switch (selectedCategory) {
      case "in_stock":
        return {
          title: "IN STOCK",
          badgeText: `${filteredProducts.length} ${filteredProducts.length === 1 ? "Product" : "Products"}`,
          subtitle: "Products currently available above the low-stock threshold",
        };
      case "low_stock":
        return {
          title: "LOW STOCK",
          badgeText: `${filteredProducts.length} ${filteredProducts.length === 1 ? "Product" : "Products"}`,
          subtitle: "Products requiring restock soon",
        };
      case "out_of_stock":
        return {
          title: "OUT OF STOCK",
          badgeText: `${filteredProducts.length} ${filteredProducts.length === 1 ? "Product" : "Products"}`,
          subtitle: "Products with zero available inventory",
        };
      case "total":
      default:
        return {
          title: "TOTAL PRODUCTS",
          badgeText: `${filteredProducts.length} ${filteredProducts.length === 1 ? "Product" : "Products"}`,
          subtitle: `Complete catalogue of ${productsList.length} automobile accessories and fitments`,
        };
    }
  };

  const categoryMeta = getCategoryMeta();

  const handleAddProductSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-6 lg:px-12 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Reused Top Header */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 lg:px-12 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Products</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-8 max-w-7xl w-full">
          {/* 1. Summary Cards */}
          <InventorySummaryCards
            cards={dynamicCards}
            selectedType={selectedCategory}
            onSelectCard={(type) => setSelectedCategory(type === selectedCategory ? null : type)}
          />

          {/* 2. Products Table */}
          <ProductsInventoryTable
            products={filteredProducts}
            title={categoryMeta.title}
            badgeText={categoryMeta.badgeText}
            subtitle={categoryMeta.subtitle}
          />
        </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />
    </>
  );
}
