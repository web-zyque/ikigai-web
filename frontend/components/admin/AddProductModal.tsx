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
  Tag,
  CircleDollarSign,
  Car,
} from "lucide-react";

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: Record<string, unknown>) => void;
}

type TabType = "general" | "images" | "pricing" | "specs";

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const mainImageInputId = useId();
  const additionalImagesInputId = useId();

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Form State - 1. Basic Info
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Lighting");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // 2. Images State
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // 3. Pricing & Inventory State
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxGst, setTaxGst] = useState("18% GST");
  const [stockQuantity, setStockQuantity] = useState<number | "">("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // 4. Product Details (Vehicle & Specs)
  const [vehicleCompatibility, setVehicleCompatibility] = useState("");
  const [productType, setProductType] = useState("Aftermarket Upgrade");
  const [color, setColor] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [warranty, setWarranty] = useState("1 Year Replacement");
  const [material, setMaterial] = useState("");
  const [productStatus, setProductStatus] = useState<"Active" | "Draft" | "Out of Stock">("Active");

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Compute stock status automatically based on quantity
  const getComputedStockStatus = () => {
    if (stockQuantity === "" || stockQuantity === 0 || Number(stockQuantity) <= 0) {
      return {
        label: "Out of Stock",
        style: "bg-red-950/40 text-red-400 border-red-800/50",
        icon: AlertCircle,
        dot: "bg-red-500",
      };
    }
    if (Number(stockQuantity) <= (lowStockThreshold || 5)) {
      return {
        label: "Low Stock",
        style: "bg-amber-950/40 text-amber-400 border-amber-800/50",
        icon: AlertTriangle,
        dot: "bg-amber-400",
      };
    }
    return {
      label: "In Stock",
      style: "bg-emerald-950/40 text-emerald-400 border-emerald-800/50",
      icon: CheckCircle2,
      dot: "bg-emerald-400",
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

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    { id: "general", label: "General", icon: Tag, hasError: hasGeneralErrors },
    { id: "images", label: "Images", icon: ImageIcon, hasError: hasImageErrors },
    { id: "pricing", label: "Pricing & Stock", icon: CircleDollarSign, hasError: hasPricingErrors },
    { id: "specs", label: "Vehicle & Specs", icon: Car, hasError: false },
  ] as const;

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl flex flex-col rounded-2xl border border-neutral-800 bg-[#0d0f12] text-neutral-100 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4 bg-[#111317]/90">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Add Product
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Quickly configure automotive specifications, pricing &amp; fitment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User-Friendly Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-800/80 bg-[#0f1115] px-6 gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? "border-red-500 text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-red-500" : "text-neutral-500"}`} />
                <span>{tab.label}</span>
                {tab.hasError && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" title="Requires attention" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body - Clean, Compact & Non-Scrolling */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 text-xs min-h-[360px] max-h-[60vh] overflow-y-auto">
            {/* TAB 1: GENERAL (Basic Info) */}
            {activeTab === "general" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        if (errors.productName) setErrors((prev) => ({ ...prev, productName: "" }));
                      }}
                      placeholder="e.g. Xenon Matrix H11 LED Headlights"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                    {errors.productName && <p className="text-red-400 text-[11px] mt-1">{errors.productName}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">
                      Product SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => {
                        setSku(e.target.value);
                        if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
                      }}
                      placeholder="e.g. LED-H11-001"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                    {errors.sku && <p className="text-red-400 text-[11px] mt-1">{errors.sku}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white focus:border-red-500/60 focus:outline-none"
                    >
                      <option value="Lighting">Lighting</option>
                      <option value="Fog Lamps">Fog Lamps</option>
                      <option value="Headlights">Headlights</option>
                      <option value="Tail Lights">Tail Lights</option>
                      <option value="Horns">Horns</option>
                      <option value="Seat Covers">Seat Covers</option>
                      <option value="Car Perfumes">Car Perfumes</option>
                      <option value="Android Stereos">Android Stereos</option>
                      <option value="Roof Light Bars">Roof Light Bars</option>
                      <option value="Mirror Covers">Mirror Covers</option>
                      <option value="Exterior Accessories">Exterior Accessories</option>
                      <option value="Other Accessories">Other Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Redline Pro, Bosch, Philips"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-neutral-300 mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Lumens, voltage, waterproof rating, packaging notes..."
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
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
                    <label className="block font-medium text-neutral-300 mb-1">
                      Main Product Image <span className="text-red-500">*</span>
                    </label>
                    {mainImage ? (
                      <div className="relative rounded-xl border border-neutral-700 bg-neutral-900/60 p-3 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mainImage}
                          alt="Main Preview"
                          className="h-20 w-20 rounded-lg object-cover border border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">Main Photo Uploaded</p>
                          <label
                            htmlFor={mainImageInputId}
                            className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer block mt-1 font-medium"
                          >
                            Replace Image
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMainImage(null)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
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
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 hover:border-red-500/60 bg-[#121418] p-6 cursor-pointer transition-colors"
                      >
                        <Upload className="h-7 w-7 text-neutral-500 mb-2" />
                        <span className="text-xs font-semibold text-neutral-200">Upload Main Photo</span>
                        <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                        <input
                          id={mainImageInputId}
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.mainImage && <p className="text-red-400 text-[11px] mt-1">{errors.mainImage}</p>}
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Additional Images</label>
                    <label
                      htmlFor={additionalImagesInputId}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 bg-[#121418] p-6 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="h-7 w-7 text-neutral-500 mb-2" />
                      <span className="text-xs font-semibold text-neutral-200">+ Add Angle / Detail Photos</span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">Upload multiple alternate angles</span>
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
                              className="h-12 w-12 rounded-lg object-cover border border-neutral-700"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(idx)}
                              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[10px]"
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
                <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#121418] px-4 py-3">
                  <span className="text-xs text-neutral-400">
                    Stock status calculates automatically:
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${computedStock.style}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${computedStock.dot}`} />
                    <span>{computedStock.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sellingPrice}
                      onChange={(e) => {
                        setSellingPrice(e.target.value);
                        if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                      }}
                      placeholder="2,499"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                    {errors.sellingPrice && <p className="text-red-400 text-[11px] mt-1">{errors.sellingPrice}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Original / MRP (₹)</label>
                    <input
                      type="text"
                      value={mrpPrice}
                      onChange={(e) => setMrpPrice(e.target.value)}
                      placeholder="3,499"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Discount (%)</label>
                    <input
                      type="text"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="25%"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Tax / GST</label>
                    <input
                      type="text"
                      value={taxGst}
                      onChange={(e) => setTaxGst(e.target.value)}
                      placeholder="18% GST"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">
                      Stock Quantity (Units) <span className="text-red-500">*</span>
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
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                    {errors.stockQuantity && <p className="text-red-400 text-[11px] mt-1">{errors.stockQuantity}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="1"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      placeholder="5"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Quantity $\le$ this threshold triggers &quot;Low Stock&quot;.
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
                    <label className="block font-medium text-neutral-200 mb-1">
                      Vehicle Compatibility <span className="text-red-400 text-[11px] font-normal">(Crucial fitment info)</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleCompatibility}
                      onChange={(e) => setVehicleCompatibility(e.target.value)}
                      placeholder="e.g. Hyundai Creta 2020–2024, Kia Seltos 2019–2024"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Product Type</label>
                    <input
                      type="text"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="e.g. Plug-and-Play Kit"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Color / Finish</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. 6500K Pure White"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Size / Dimensions</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. H11 Socket / 32-inch Bar"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-300 mb-1">Warranty</label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      placeholder="e.g. 2 Years Replacement"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-medium text-neutral-300 mb-1">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 6063 Aviation Aluminum + IP68 Seal"
                      className="w-full rounded-lg border border-neutral-800 bg-[#121418] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-red-500/60 focus:outline-none"
                    />
                  </div>

                  {/* Product Status */}
                  <div className="md:col-span-2 pt-2">
                    <label className="block font-medium text-neutral-300 mb-2">Publishing Status</label>
                    <div className="flex flex-wrap gap-3">
                      {(["Active", "Draft", "Out of Stock"] as const).map((status) => (
                        <label
                          key={status}
                          className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 cursor-pointer transition-all ${
                            productStatus === status
                              ? "border-red-600/50 bg-red-950/20 text-white"
                              : "border-neutral-800 bg-[#121418] text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="productStatus"
                            value={status}
                            checked={productStatus === status}
                            onChange={() => setProductStatus(status)}
                            className="accent-red-600"
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

          {/* Bottom Actions: EXACTLY TWO BUTTONS: Cancel and Add Product */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 bg-[#111317]/90 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-2.5 text-xs md:text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-700"
            >
              Cancel
            </button>

            {/* Save: Uses the rich darker red glassy button theme */}
            <button
              type="submit"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-red-600/50 bg-gradient-to-r from-red-950/90 via-red-900/85 to-red-950/90 px-7 py-2.5 text-xs md:text-sm font-bold tracking-wide text-white shadow-[0_8px_32px_-6px_rgba(185,28,28,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-300 hover:border-red-500/70 hover:bg-gradient-to-r hover:from-red-900 hover:via-red-800/90 hover:to-red-900 hover:shadow-[0_12px_36px_-4px_rgba(220,38,38,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-[0.99]"
            >
              {/* Glass Top Sheen Reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent opacity-60 transition-opacity group-hover:opacity-90"
              />
              <span className="relative z-10 drop-shadow-sm">Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
