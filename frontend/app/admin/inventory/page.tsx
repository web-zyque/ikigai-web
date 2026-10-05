"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import InventoryHeader from "@/components/admin/InventoryHeader";
import InventorySummaryCards, {
  InventoryCardType,
  InventoryMetricCard,
} from "@/components/admin/InventorySummaryCards";
import ProductsInventoryTable, {
  ALL_DEMO_PRODUCTS,
  InventoryProduct,
  InventoryStatus,
} from "@/components/admin/ProductsInventoryTable";
import AddProductModal from "@/components/admin/AddProductModal";
import { Package, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function ProductsInventoryPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCardType | null>(null);

  // Products state initialized with the 12 realistic automotive accessory products
  const [productsList, setProductsList] = useState<InventoryProduct[]>(ALL_DEMO_PRODUCTS);

  // Derive counts dynamically for complete backend scalability
  const totalCount = productsList.length;
  const inStockCount = productsList.filter((p) => p.status === "In Stock").length;
  const lowStockCount = productsList.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = productsList.filter((p) => p.status === "Out of Stock").length;

  const dynamicCards: InventoryMetricCard[] = [
    {
      type: "total",
      title: "TOTAL PRODUCT",
      value: totalCount,
      description: "All active car accessories catalogued",
      footer: "Explore entire catalog",
      icon: Package,
    },
    {
      type: "in_stock",
      title: "IN STOCK",
      value: inStockCount,
      description: "Healthy inventory levels above threshold",
      footer: "Filter by in-stock items",
      icon: CheckCircle2,
    },
    {
      type: "low_stock",
      title: "LOW STOCK",
      value: lowStockCount,
      description: "Requires restock soon (≤ 5 units left)",
      footer: "View items requiring restock",
      icon: AlertTriangle,
    },
    {
      type: "out_of_stock",
      title: "OUT OF STOCK",
      value: outOfStockCount,
      description: "Zero units remaining • Critical attention",
      footer: "View depleted items",
      icon: AlertCircle,
    },
  ];

  // Filter products based on selected category
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

  // Add Product submission handler
  const handleAddProductSuccess = (newProductData: Record<string, unknown>) => {
    const rawPrice = String(newProductData.sellingPrice || "").trim();
    const formattedPrice = rawPrice.startsWith("₹") ? rawPrice : `₹${rawPrice}`;

    const newProduct: InventoryProduct = {
      id: `prod-${Date.now()}`,
      name: String(newProductData.productName || "New Accessory"),
      category: String(newProductData.category || "Other Accessories"),
      sku: String(newProductData.sku || `SKU-${Date.now()}`),
      price: formattedPrice,
      stock: Number(newProductData.stockQuantity || 0),
      status: (newProductData.stockStatus as InventoryStatus) || "In Stock",
    };

    setProductsList((prev) => [newProduct, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-black text-white antialiased selection:bg-[#640C0C]/40 selection:text-white">
      {/* Reused Fixed Desktop / Mobile Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Reused Top Header */}
        <AdminHeader
          title="Products & Inventory"
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
        />

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-8 max-w-7xl w-full">
          {/* Top Wide Banner: Add Product */}
          <InventoryHeader onAddProduct={() => setIsAddModalOpen(true)} />

          {/* VIEW SWITCHING:
              When in Overview (selectedCategory === null): Show ONLY the 4 summary cards.
              When a Card is Clicked (selectedCategory !== null): The 4 cards DISAPPEAR, and ONLY the dedicated category view appears! */}
          {selectedCategory === null ? (
            <div className="animate-in fade-in duration-300">
              <InventorySummaryCards
                cards={dynamicCards}
                onSelectCard={(type) => setSelectedCategory(type)}
              />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <ProductsInventoryTable
                products={filteredProducts}
                title={categoryMeta.title}
                badgeText={categoryMeta.badgeText}
                subtitle={categoryMeta.subtitle}
                onBackToOverview={() => setSelectedCategory(null)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />
    </div>
  );
}
