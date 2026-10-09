"use client";

import React, { useState, useId, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useCategories, useCreateProduct } from "@/hooks/use-products";
import { useUploadImage } from "@/hooks/use-upload";

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

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadImage();

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());

  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [taxGst, setTaxGst] = useState("18");
  const [stockQuantity, setStockQuantity] = useState<number | "">("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  const [vehicleCompatibility, setVehicleCompatibility] = useState("");
  const [productType, setProductType] = useState("");
  const [color, setColor] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [warranty, setWarranty] = useState("");
  const [material, setMaterial] = useState("");
  const [productStatus, setProductStatus] = useState<"active" | "draft">("active");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    const selling = parseFloat(sellingPrice) || 0;
    const mrp = parseFloat(mrpPrice) || 0;
    
    if (selling > 0 && mrp > selling) {
      const calculatedDiscount = ((mrp - selling) / mrp) * 100;
      setDiscount(calculatedDiscount.toFixed(1));
    } else {
      setDiscount("");
    }
  }, [sellingPrice, mrpPrice]);

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

  const hasGeneralErrors = !!(errors.productName || errors.sku || errors.categoryId);
  const hasImageErrors = !!errors.mainImage;
  const hasPricingErrors = !!(errors.sellingPrice || errors.stockQuantity);

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setMainImageUrl(previewUrl);
      setErrors((prev) => ({ ...prev, mainImage: "" }));
    }
  };

  const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdditionalImageFiles((prev) => [...prev, ...filesArray]);
      
      // Create preview URLs
      const newUrls = filesArray.map((f) => URL.createObjectURL(f));
      setAdditionalImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    setAdditionalImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setAdditionalImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload all images and return their URLs
  const uploadAllImages = async () => {
    const imagePromises: Promise<string>[] = [];
    
    // Upload main image
    if (mainImageFile) {
      imagePromises.push(
        uploadImageMutation.mutateAsync(mainImageFile).then(result => result.url)
      );
    }
    
    // Upload additional images
    for (const file of additionalImageFiles) {
      imagePromises.push(
        uploadImageMutation.mutateAsync(file).then(result => result.url)
      );
    }
    
    return Promise.all(imagePromises);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newErrors: Record<string, string> = {};

      if (!productName.trim()) newErrors.productName = "Product name is required";
      if (!sku.trim()) newErrors.sku = "SKU is required";
      if (!selectedCategoryId) newErrors.categoryId = "Category is required";
      if (!sellingPrice.trim()) newErrors.sellingPrice = "Selling price is required";
      if (stockQuantity === "") newErrors.stockQuantity = "Stock quantity is required";
      if (!mainImageFile) newErrors.mainImage = "Main product image is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Auto-switch to the first tab that has an error
        if (newErrors.productName || newErrors.sku || newErrors.categoryId) {
          setActiveTab("general");
        } else if (newErrors.mainImage) {
          setActiveTab("images");
        } else if (newErrors.sellingPrice || newErrors.stockQuantity) {
          setActiveTab("pricing");
        }
        return;
      }

      // Upload all images first
      const uploadedUrls = await uploadAllImages();
      
      // Prepare image data
      const images = [
        {
          imageUrl: uploadedUrls[0], // Main image
          isMainImage: true,
          altText: productName,
        },
        // Additional images
        ...uploadedUrls.slice(1).map(url => ({
          imageUrl: url,
          isMainImage: false,
          altText: productName,
        })),
      ];

      // Prepare vehicle compatibility array
      const vehicleCompatibilityArray = vehicleCompatibility
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      const productData = {
        name: productName.trim(),
        sku: sku.trim(),
        categoryId: selectedCategoryId,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        sellingPrice: parseFloat(sellingPrice),
        mrpPrice: mrpPrice ? parseFloat(mrpPrice) : undefined,
        gstPercentage: parseFloat(taxGst),
        stockQuantity: Number(stockQuantity),
        lowStockThreshold,
        publicationStatus: productStatus,
        vehicleCompatibility: vehicleCompatibilityArray.length > 0 ? vehicleCompatibilityArray : undefined,
        productType: productType.trim() || undefined,
        color: color.trim() || undefined,
        dimensions: dimensions.trim() || undefined,
        warranty: warranty.trim() || undefined,
        material: material.trim() || undefined,
        images,
      };

      const result = await createProductMutation.mutateAsync(productData);
      
      // Call success callback with the created product
      onSuccess?.({
        id: result.id,
        productName: result.name,
        sku: result.sku,
        category: result.category.name,
        sellingPrice: result.sellingPrice,
        stockQuantity: result.stockQuantity,
        stockStatus: result.inventoryStatus === 'in_stock' ? 'In Stock' : 
                   result.inventoryStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock',
        price: `₹${result.sellingPrice}`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Failed to create product:', error);
      setErrors({ submit: error.message || 'Failed to create product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setProductName("");
      setSku("");
      setSelectedCategoryId("");
      setBrand("");
      setDescription("");
      setMainImageFile(null);
      setMainImageUrl(null);
      setAdditionalImageFiles([]);
      setAdditionalImageUrls([]);
      setSellingPrice("");
      setMrpPrice("");
      setDiscount("");
      setTaxGst("18");
      setStockQuantity("");
      setLowStockThreshold(5);
      setVehicleCompatibility("");
      setProductType("");
      setColor("");
      setDimensions("");
      setWarranty("");
      setMaterial("");
      setProductStatus("active");
      setErrors({});
      setActiveTab("general");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Close modal on Escape key and lock body scroll
  useEffect(() => {
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
              Add Product
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Quickly configure automotive specifications, pricing &amp; fitment
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
        <div className="flex items-center border-b border-white/5 bg-[#0e0e0e] px-6 gap-2 overflow-x-auto">
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
                    ? "border-[#640C0C] text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#640C0C]" : "text-white/40"}`} />
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
                    {categoriesLoading ? (
                      <div className="flex items-center space-x-2 text-white/60 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Loading categories...</span>
                      </div>
                    ) : (
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => {
                          setSelectedCategoryId(e.target.value);
                          if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                        }}
                        className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                      >
                        <option value="" className="bg-[#121212] text-white">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id} className="bg-[#121212] text-white">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.categoryId && <p className="text-[#640C0C] text-[11px] mt-1">{errors.categoryId}</p>}
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
                    {mainImageUrl ? (
                      <div className="relative rounded-xl border border-white/10 bg-[#0a0a0a] p-3 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mainImageUrl}
                          alt="Main Preview"
                          className="h-20 w-20 rounded-lg object-cover bg-[#121212] border border-white/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {mainImageFile?.name || "Main Photo Uploaded"}
                          </p>
                          <label
                            htmlFor={mainImageInputId}
                            className="text-[11px] text-[#640C0C] hover:text-[#7a1010] cursor-pointer block mt-1 font-medium"
                          >
                            Replace Image
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMainImageFile(null);
                            setMainImageUrl(null);
                          }}
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

                    {additionalImageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {additionalImageUrls.map((imgUrl, idx) => (
                          <div key={idx} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Alternate ${idx + 1}`}
                              className="h-12 w-12 rounded-lg object-cover bg-[#121212] border border-white/10"
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
                      type="number"
                      step="0.01"
                      min="0"
                      value={sellingPrice}
                      onChange={(e) => {
                        setSellingPrice(e.target.value);
                        if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                      }}
                      placeholder="2499"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs font-semibold text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                    {errors.sellingPrice && <p className="text-[#640C0C] text-[11px] mt-1">{errors.sellingPrice}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Original / MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mrpPrice}
                      onChange={(e) => setMrpPrice(e.target.value)}
                      placeholder="3499"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">Discount (%)</label>
                    <input
                      type="text"
                      value={discount}
                      readOnly
                      placeholder="Auto-calculated"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0a0a]/50 px-3.5 py-2.5 text-xs text-white/70 placeholder:text-white/40 cursor-not-allowed"
                      title="Automatically calculated from MRP and selling price"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-white/80 mb-1.5">GST (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={taxGst}
                      onChange={(e) => setTaxGst(e.target.value)}
                      placeholder="18"
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
                      Quantity ≤ this threshold triggers &quot;Low Stock&quot;.
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
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Separate multiple vehicles with commas.
                    </span>
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
                      {(["active", "draft"] as const).map((status) => (
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
                          <span className="text-xs font-medium capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Draft products won&apos;t be visible to customers until published as Active.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions: Cancel and Save */}
          <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-[#0a0a0a] px-6 py-4">
            {errors.submit && (
              <p className="text-[#640C0C] text-xs mr-auto">{errors.submit}</p>
            )}
            
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || categoriesLoading}
              className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating Product...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
