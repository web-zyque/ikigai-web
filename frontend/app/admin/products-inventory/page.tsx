"use client";

import React, { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import InventoryHeader from "@/components/admin/InventoryHeader";
import type { StockFilterType } from "@/components/admin/InventorySummaryCards";
import ProductsInventoryTable, {
  ALL_DEMO_PRODUCTS,
  InventoryProduct,
  InventoryStatus,
} from "@/components/admin/ProductsInventoryTable";
import AddProductModal from "@/components/admin/AddProductModal";

export default function ProductsInventoryPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // Products state initialized with the realistic automotive catalog products
  const [productsList, setProductsList] = useState<InventoryProduct[]>(ALL_DEMO_PRODUCTS);

  // 1. Stock Status Filter State: "all" | "low_stock" | "stock_out"
  const [stockFilter, setStockFilter] = useState<StockFilterType>("all");

  // 2. Product Search State (Name, Category, SKU)
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 3. Pagination State (Max 15 products per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 15;

  // Real-time stock counts for the 3 compact filter cards
  const counts = useMemo(() => {
    return {
      all: productsList.length,
      lowStock: productsList.filter(
        (p) => p.status === "Low Stock" || (p.stock > 0 && p.stock <= 5)
      ).length,
      stockOut: productsList.filter(
        (p) => p.status === "Out of Stock" || p.stock === 0
      ).length,
    };
  }, [productsList]);

  // Handle stock filter change (resets pagination to page 1)
  const handleFilterChange = (newFilter: StockFilterType) => {
    setStockFilter(newFilter);
    setCurrentPage(1);
  };

  // Handle search query change (resets pagination to page 1)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    setStockFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter products based on stockFilter AND searchQuery (Product Name, Category, SKU)
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return productsList.filter((product) => {
      // 1. Stock Status filter condition
      if (stockFilter === "low_stock") {
        const isLowStock =
          product.status === "Low Stock" || (product.stock > 0 && product.stock <= 5);
        if (!isLowStock) return false;
      } else if (stockFilter === "stock_out") {
        const isStockOut = product.status === "Out of Stock" || product.stock === 0;
        if (!isStockOut) return false;
      }

      // 2. Search query filter across Name, Category, SKU
      if (query) {
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);

        if (!matchesName && !matchesCategory && !matchesSku) {
          return false;
        }
      }

      return true;
    });
  }, [productsList, stockFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PAGE_SIZE);

  // Save (Add or Edit) Product submission handler
  const handleSaveProductSuccess = (productData: Record<string, unknown>) => {
    const rawPrice = String(productData.sellingPrice || "").trim();
    const formattedPrice = rawPrice.startsWith("₹") ? rawPrice : `₹${rawPrice}`;

    if (editingProduct) {
      // Update existing product
      setProductsList((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                name: String(productData.productName || item.name),
                category: String(productData.category || item.category),
                sku: String(productData.sku || item.sku),
                price: formattedPrice || item.price,
                stock: Number(productData.stockQuantity ?? item.stock),
                status: (productData.stockStatus as InventoryStatus) || item.status,
                image: (productData.mainImage as string) || item.image,
              }
            : item
        )
      );
      setEditingProduct(null);
    } else {
      // Add new product
      const newProduct: InventoryProduct = {
        id: `prod-${Date.now()}`,
        name: String(productData.productName || "New Accessory"),
        category: String(productData.category || "Other Accessories"),
        sku: String(productData.sku || `SKU-${Date.now()}`),
        price: formattedPrice,
        stock: Number(productData.stockQuantity || 0),
        status: (productData.stockStatus as InventoryStatus) || "In Stock",
        image: (productData.mainImage as string) || "/images/category_lighting.jpg",
      };

      setProductsList((prev) => [newProduct, ...prev]);
    }
  };

  const handleEditProduct = (prod: InventoryProduct) => {
    setEditingProduct(prod);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsAddModalOpen(true);
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

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-6 max-w-7xl w-full">
          {/* Top Wide Banner: Add Product */}
          <InventoryHeader onAddProduct={handleOpenAddModal} />

          {/* Products & Inventory Section with Integrated Cards and Search */}
          <div className="animate-in fade-in duration-300">
            <ProductsInventoryTable
              products={paginatedProducts}
              totalFilteredCount={filteredProducts.length}
              totalCount={productsList.length}
              currentPage={safeCurrentPage}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onResetFilters={handleResetFilters}
              activeFilter={stockFilter}
              onFilterChange={handleFilterChange}
              counts={counts}
              onEditProduct={handleEditProduct}
            />
          </div>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <AddProductModal
          key={editingProduct ? editingProduct.id : "new-product"}
          isOpen={isAddModalOpen}
          initialProduct={editingProduct}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={handleSaveProductSuccess}
        />
      )}
    </div>
  );
}
