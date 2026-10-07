"use client";

import React, { useState, useId } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { InventoryProduct } from "./ProductsInventoryTable";

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: Record<string, unknown>) => void;
  initialProduct?: InventoryProduct | null;
}

type TabType = "general" | "images" | "pricing" | "specs";

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
  initialProduct,
}: AddProductModalProps) {
  const mainImageInputId = useId();
  const additionalImagesInputId = useId();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Form State - 1. Basic Info
  const [productName, setProductName] = useState(initialProduct?.name || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [category, setCategory] = useState(initialProduct?.category || "Lighting");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // 2. Images State
  const [mainImage, setMainImage] = useState<string | null>(initialProduct?.image || null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // 3. Pricing & Inventory State
  const [sellingPrice, setSellingPrice] = useState(
    initialProduct?.price ? String(initialProduct.price).replace(/[^0-9]/g, "") : ""
  );
  const [mrpPrice, setMrpPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxGst, setTaxGst] = useState("18% GST");
  const [stockQuantity, setStockQuantity] = useState<number | "">(initialProduct?.stock ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // 4. Product Details (Vehicle & Specs)
  const [vehicleCompatibility, setVehicleCompatibility] = useState("");
  const [productType, setProductType] = useState("Aftermarket Upgrade");
  const [color, setColor] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [warranty, setWarranty] = useState("1 Year Replacement");
  const [material, setMaterial] = useState("");
  const [productStatus, setProductStatus] = useState<"Active" | "Draft" | "Out of Stock">(
    initialProduct?.status === "Out of Stock" ? "Out of Stock" : "Active"
  );

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Compute stock status automatically based on quantity
  const getComputedStockStatus = () => {
    if (stockQuantity === "" || stockQuantity === 0 || Number(stockQuantity) <= 0) {
      return {
        label: "Out of Stock",
        style: "bg-[#640C0C]/25 text-white border-[#640C0C]/50",
        icon: AlertCircle,
        dot: "bg-[#640C0C]",
      };
    }
    if (Number(stockQuantity) <= (lowStockThreshold || 5)) {
      return {
        label: "Low Stock",
        style: "bg-white/10 text-white border-white/20",
        icon: AlertTriangle,
        dot: "bg-white/80",
      };
    }
    return {
      label: "In Stock",
      style: "bg-white/5 text-white/80 border-white/15",
      icon: CheckCircle2,
      dot: "bg-white/60",
    };
  };

  const computedStock = getComputedStockStatus();

  // Check which tabs have validation errors
  const hasGeneralErrors = !!(errors.productName || errors.sku || errors.category);
  const hasImageErrors = !!errors.mainImage;
  const hasPricingErrors = !!(errors.sellingPrice || errors.stockQuantity);

  // Handle Main Image Upload
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setMainImage(url);
      setErrors((prev) => ({ ...prev, mainImage: "" }));
    }
  };

  // Handle Additional Images
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map((f) => URL.createObjectURL(f));
      setAdditionalImages((prev) => [...prev, ...newUrls]);
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setAdditionalImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Step Navigation Handlers
  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (activeTab === "general") {
      if (!productName.trim()) newErrors.productName = "Product name is required";
      if (!sku.trim()) newErrors.sku = "SKU is required";
      if (!category.trim()) newErrors.category = "Category is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
      setActiveTab("images");
    } else if (activeTab === "images") {
      if (!mainImage) newErrors.mainImage = "Main product image is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
      setActiveTab("pricing");
    } else if (activeTab === "pricing") {
      if (!sellingPrice.trim()) newErrors.sellingPrice = "Selling price is required";
      if (stockQuantity === "") newErrors.stockQuantity = "Stock quantity is required";
      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return;
      }
      setActiveTab("specs");
    }
  };

  const handleBack = () => {
    if (activeTab === "specs") setActiveTab("pricing");
    else if (activeTab === "pricing") setActiveTab("images");
    else if (activeTab === "images") setActiveTab("general");
  };

  // Final Submit Handler (Only executes on Step 4 - specs)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Final save/update can ONLY execute on Step 4 (specs)
    if (activeTab !== "specs") {
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!productName.trim()) newErrors.productName = "Product name is required";
    if (!sku.trim()) newErrors.sku = "SKU is required";
    if (!category.trim()) newErrors.category = "Category is required";
    if (!sellingPrice.trim()) newErrors.sellingPrice = "Selling price is required";
    if (stockQuantity === "") newErrors.stockQuantity = "Stock quantity is required";
    if (!mainImage) newErrors.mainImage = "Main product image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto-switch to the first tab that has an error
      if (newErrors.productName || newErrors.sku || newErrors.category) {
        setActiveTab("general");
      } else if (newErrors.mainImage) {
        setActiveTab("images");
      } else if (newErrors.sellingPrice || newErrors.stockQuantity) {
        setActiveTab("pricing");
      }
      return;
    }

    const newProduct = {
      productName,
      sku,
      category,
      brand,
      description,
      mainImage,
      additionalImages,
      sellingPrice,
      mrpPrice,
      discount,
      taxGst,
      stockQuantity: Number(stockQuantity),
      lowStockThreshold,
      stockStatus: computedStock.label,
      vehicleCompatibility,
      productType,
      color,
      dimensions,
      warranty,
      material,
      productStatus,
    };

    onSuccess?.(newProduct);
    onClose();
  };

  // Close modal on Escape key and lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const tabs = [
    { id: "general", step: 1, label: "General", hasError: hasGeneralErrors },
    { id: "images", step: 2, label: "Images", hasError: hasImageErrors },
    { id: "pricing", step: 3, label: "Pricing & Stock", hasError: hasPricingErrors },
    { id: "specs", step: 4, label: "Vehicle & Specs", hasError: false },
  ] as const;

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#640C0C]" />
              {initialProduct ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              {initialProduct
                ? "Update automotive specifications, pricing & fitment"
                : "Quickly configure automotive specifications, pricing & fitment"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center border-b border-white/5 bg-[#0e0e0e] px-4 sm:px-6 gap-1 sm:gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? "border-[#640C0C] text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                    isActive
                      ? "bg-[#640C0C] text-white shadow-sm"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {tab.step}
                </span>
                <span>{tab.label}</span>
                {tab.hasError && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" title="Requires attention" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 text-xs min-h-[360px] max-h-[60vh] overflow-y-auto">
            {/* TAB 1: GENERAL (Basic Info) */}
            {activeTab === "general" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Product Name <span className="text-[#640C0C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        if (errors.productName) setErrors((prev) => ({ ...prev, productName: "" }));
                      }}
                      placeholder="e.g. Xenon Matrix H11 LED Headlights"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    {errors.productName && <p className="text-[#640C0C] text-[11px] mt-1">{errors.productName}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Product SKU <span className="text-[#640C0C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value);
                        if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
                      }}
                      placeholder="e.g. LED-H11-001"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    {errors.sku && <p className="text-[#640C0C] text-[11px] mt-1">{errors.sku}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Category <span className="text-[#640C0C]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                    >
                      <option value="Lighting" className="bg-[#121212] text-white">Lighting</option>
                      <option value="Fog Lamps" className="bg-[#121212] text-white">Fog Lamps</option>
                      <option value="Headlights" className="bg-[#121212] text-white">Headlights</option>
                      <option value="Tail Lights" className="bg-[#121212] text-white">Tail Lights</option>
                      <option value="Horns" className="bg-[#121212] text-white">Horns</option>
                      <option value="Seat Covers" className="bg-[#121212] text-white">Seat Covers</option>
                      <option value="Car Perfumes" className="bg-[#121212] text-white">Car Perfumes</option>
                      <option value="Android Stereos" className="bg-[#121212] text-white">Android Stereos</option>
                      <option value="Roof Light Bars" className="bg-[#121212] text-white">Roof Light Bars</option>
                      <option value="Mirror Covers" className="bg-[#121212] text-white">Mirror Covers</option>
                      <option value="Exterior Accessories" className="bg-[#121212] text-white">Exterior Accessories</option>
                      <option value="Other Accessories" className="bg-[#121212] text-white">Other Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Redline Pro, Bosch, Philips"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-white/80 mb-1.5">Product Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Lumens, voltage, waterproof rating, packaging notes..."
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: IMAGES */}
            {activeTab === "images" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Main Image */}
                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Main Product Image <span className="text-[#640C0C]">*</span>
                    </label>
                    {mainImage ? (
                      <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-3 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mainImage}
                          alt="Main Preview"
                          className="h-20 w-20 rounded-lg object-contain bg-[#121212] border border-white/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">Main Photo Uploaded</p>
                          <label
                            htmlFor={mainImageInputId}
                            className="text-[11px] text-[#640C0C] hover:text-[#7a1010] cursor-pointer block mt-1 font-medium"
                          >
                            Replace Image
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMainImage(null)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-[#640C0C] transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <input
                          id={mainImageInputId}
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor={mainImageInputId}
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 hover:border-[#640C0C] bg-[#0a0a0a] p-6 cursor-pointer transition-colors"
                      >
                        <Upload className="h-7 w-7 text-white/40 mb-2" />
                        <span className="text-xs font-semibold text-white">Upload Main Photo</span>
                        <span className="text-[10px] text-white/40 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                        <input
                          id={mainImageInputId}
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.mainImage && <p className="text-[#640C0C] text-[11px] mt-1">{errors.mainImage}</p>}
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Additional Images</label>
                    <label
                      htmlFor={additionalImagesInputId}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 hover:border-white/30 bg-[#0a0a0a] p-6 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="h-7 w-7 text-white/40 mb-2" />
                      <span className="text-xs font-semibold text-white">+ Add Angle / Detail Photos</span>
                      <span className="text-[10px] text-white/40 mt-0.5">Upload multiple alternate angles</span>
                      <input
                        id={additionalImagesInputId}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleAdditionalImagesChange}
                        className="hidden"
                      />
                    </label>

                    {additionalImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {additionalImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Alternate ${idx + 1}`}
                              className="h-12 w-12 rounded-lg object-contain bg-[#121212] border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(idx)}
                              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#640C0C] text-white text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRICING & INVENTORY */}
            {activeTab === "pricing" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Real-time Dynamic Stock Status Banner */}
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3">
                  <span className="text-xs text-white/60">
                    Stock status calculates automatically:
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${computedStock.style}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${computedStock.dot}`} />
                    <span>{computedStock.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Selling Price (₹) <span className="text-[#640C0C]">*</span>
                    </label>
                    <input
                      type="text"
                      value={sellingPrice}
                      onChange={(e) => {
                        setSellingPrice(e.target.value);
                        if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                      }}
                      placeholder="2,499"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    {errors.sellingPrice && <p className="text-[#640C0C] text-[11px] mt-1">{errors.sellingPrice}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Original / MRP (₹)</label>
                    <input
                      type="text"
                      value={mrpPrice}
                      onChange={(e) => setMrpPrice(e.target.value)}
                      placeholder="3,499"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Discount (%)</label>
                    <input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="25%"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Tax / GST</label>
                    <input
                      type="text"
                      value={taxGst}
                      onChange={(e) => setTaxGst(e.target.value)}
                      placeholder="18% GST"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">
                      Stock Quantity (Units) <span className="text-[#640C0C]">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => {
                        setStockQuantity(e.target.value === "" ? "" : Number(e.target.value));
                        if (errors.stockQuantity) setErrors((prev) => ({ ...prev, stockQuantity: "" }));
                      }}
                      placeholder="e.g. 18"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    {errors.stockQuantity && <p className="text-[#640C0C] text-[11px] mt-1">{errors.stockQuantity}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      placeholder="5"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Quantity &le; this threshold triggers &quot;Low Stock&quot;.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VEHICLE & SPECS */}
            {activeTab === "specs" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-medium text-white/80 mb-1.5">
                      Vehicle Compatibility <span className="text-white/40 text-[11px] font-normal">(Crucial fitment info)</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleCompatibility}
                      onChange={(e) => setVehicleCompatibility(e.target.value)}
                      placeholder="e.g. Hyundai Creta 2020–2024, Kia Seltos 2019–2024"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Product Type</label>
                    <input
                      type="text"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="e.g. Plug-and-Play Kit"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Color / Finish</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. 6500K Pure White"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Size / Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. H11 Socket / 32-inch Bar"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Warranty</label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      placeholder="e.g. 2 Years Replacement"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-white/80 mb-1.5">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 6063 Aviation Aluminum + IP68 Seal"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Product Status */}
                  <div className="md:col-span-2 pt-2">
                    <label className="block font-medium text-white/80 mb-2">Publishing Status</label>
                    <div className="flex flex-wrap gap-3">
                      {(["Active", "Draft", "Out of Stock"] as const).map((status) => (
                        <label
                          key={status}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer transition-all ${
                            productStatus === status
                              ? "border-[#640C0C] bg-[#640C0C]/20 text-white"
                              : "border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="productStatus"
                            value={status}
                            checked={productStatus === status}
                            onChange={() => setProductStatus(status)}
                            className="accent-[#640C0C]"
                          />
                          <span className="text-xs font-medium">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-[#0a0a0a] px-6 py-4">
            {activeTab !== "general" && (
              <button
                key="btn-back"
                type="button"
                onClick={handleBack}
                className="rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            {activeTab !== "specs" ? (
              <button
                key="btn-next"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
                className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-sm font-medium text-white transition-all shadow-md cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                key="btn-save"
                type="submit"
                className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-sm font-medium text-white transition-all shadow-md cursor-pointer"
              >
                {initialProduct ? "Save Changes" : "Save Product"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
