"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useCategories, useCreateProduct } from "@/hooks/use-products";
import { useUploadImage } from "@/hooks/use-upload";

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: Record<string, unknown>) => void;
}

const DEFAULT_CATEGORIES = [
  { id: "cat-lighting", name: "Lighting" },
  { id: "cat-roof-lights", name: "Roof Lights" },
  { id: "cat-horns", name: "Horns" },
  { id: "cat-stereos", name: "Android Stereos" },
  { id: "cat-headlights", name: "Headlights" },
  { id: "cat-fog-lamps", name: "Fog Lamps" },
  { id: "cat-exterior", name: "Exterior Accessories" },
  { id: "cat-interior", name: "Interior Accessories" },
];

export interface UploadedImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  isMain: boolean;
  variantColor?: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { data: apiCategories } = useCategories();
  const availableCategories =
    apiCategories && apiCategories.length > 0 ? apiCategories : DEFAULT_CATEGORIES;

  const createProductMutation = useCreateProduct();
  const uploadImageMutation = useUploadImage();

  // Step 1: Basic details
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // Step 1 Attributes / Variants
  const [hasColorVariants, setHasColorVariants] = useState(false);
  const [colorValues, setColorValues] = useState<string[]>(["Black", "White"]);
  const [newColorInput, setNewColorInput] = useState("");

  const [hasSizeVariants, setHasSizeVariants] = useState(false);
  const [sizeValues, setSizeValues] = useState<string[]>(["Standard"]);
  const [newSizeInput, setNewSizeInput] = useState("");

  // Step 2: Uploaded images
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingColor, setDraggingColor] = useState<string | null>(null);

  // Step 3: Pricing, Inventory, Specifications & Vehicle Compatibility
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number | string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>("5");

  const [vehicleCompatibility, setVehicleCompatibility] = useState("");
  const [productType, setProductType] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [warranty, setWarranty] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (isSubmitting) return;
    setCurrentStep(1);
    setProductName("");
    setSku("");
    setSelectedCategoryId("");
    setBrand("");
    setDescription("");
    setHasColorVariants(false);
    setColorValues(["Black", "White"]);
    setNewColorInput("");
    setHasSizeVariants(false);
    setSizeValues(["Standard"]);
    setNewSizeInput("");
    setUploadedImages([]);
    setSellingPrice("");
    setMrpPrice("");
    setStockQuantity("");
    setLowStockThreshold("5");
    setVehicleCompatibility("");
    setProductType("");
    setDimensions("");
    setMaterial("");
    setWarranty("");
    setErrors({});
    onClose();
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isSubmitting) handleClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting]);



  const handleAddColorValue = () => {
    const trimmed = newColorInput.trim();
    if (trimmed && !colorValues.includes(trimmed)) {
      setColorValues((prev) => [...prev, trimmed]);
      setNewColorInput("");
    }
  };

  const handleRemoveColorValue = (val: string) => {
    setColorValues((prev) => prev.filter((c) => c !== val));
    setUploadedImages((prev) => prev.filter((img) => img.variantColor !== val));
  };

  const handleAddSizeValue = () => {
    const trimmed = newSizeInput.trim();
    if (trimmed && !sizeValues.includes(trimmed)) {
      setSizeValues((prev) => [...prev, trimmed]);
      setNewSizeInput("");
    }
  };

  const handleRemoveSizeValue = (val: string) => {
    setSizeValues((prev) => prev.filter((s) => s !== val));
  };

  const handleFilesSelected = (files: FileList | File[], variantColor?: string) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    const newItems: UploadedImageItem[] = fileArray.map((file, idx) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: uploadedImages.length === 0 && idx === 0,
      variantColor,
    }));

    setUploadedImages((prev) => [...prev, ...newItems]);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });
  };

  const handleRemoveImage = (idToRemove: string) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((item) => item.id !== idToRemove);
      if (filtered.length > 0 && !filtered.some((item) => item.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const handleSetMainImage = (id: string) => {
    setUploadedImages((prev) =>
      prev.map((item) => ({
        ...item,
        isMain: item.id === id,
      }))
    );
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!productName.trim()) newErrors.productName = "Product title is required";
    if (!sku.trim()) newErrors.sku = "SKU identifier is required";
    if (!selectedCategoryId) newErrors.categoryId = "Category selection is required";
    if (!brand.trim()) newErrors.brand = "Brand name is required";
    if (!description.trim()) newErrors.description = "Product description is required";

    if (hasColorVariants && colorValues.length === 0) {
      newErrors.attributes = "Please add at least one color value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (uploadedImages.length < 3) {
      newErrors.images = `Minimum 3 images are required. Currently uploaded: ${uploadedImages.length}.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!sellingPrice.trim() || isNaN(parseFloat(sellingPrice)) || parseFloat(sellingPrice) < 0) {
      newErrors.sellingPrice = "Valid selling price is required";
    }
    if (!mrpPrice.trim() || isNaN(parseFloat(mrpPrice)) || parseFloat(mrpPrice) < 0) {
      newErrors.mrpPrice = "Valid MRP price is required";
    }
    if (stockQuantity === "" || Number(stockQuantity) < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadPromises = uploadedImages.map(async (item) => {
        if (item.file) {
          try {
            const res = await uploadImageMutation.mutateAsync(item.file);
            return { ...item, finalUrl: res.url };
          } catch {
            return { ...item, finalUrl: item.previewUrl };
          }
        }
        return { ...item, finalUrl: item.previewUrl };
      });

      const processedImages = await Promise.all(uploadPromises);

      const imagesPayload = processedImages.map((img, idx) => ({
        imageUrl: img.finalUrl,
        isMainImage: img.isMain,
        displayOrder: idx + 1,
        altText: img.variantColor ? `${productName} (${img.variantColor})` : productName,
      }));

      const vehicleCompatibilityArray = vehicleCompatibility
        ? vehicleCompatibility
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
        : [];

      const colorString =
        hasColorVariants && colorValues.length > 0 ? colorValues.join(", ") : undefined;
      const sizeString =
        hasSizeVariants && sizeValues.length > 0 ? sizeValues.join(", ") : undefined;

      const productPayload = {
        name: productName.trim(),
        sku: sku.trim(),
        categoryId: selectedCategoryId,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        sellingPrice: parseFloat(sellingPrice),
        mrpPrice: mrpPrice ? parseFloat(mrpPrice) : undefined,
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold) || 5,
        publicationStatus: "active" as const,
        vehicleCompatibility:
          vehicleCompatibilityArray.length > 0 ? vehicleCompatibilityArray : undefined,
        productType: productType.trim() || undefined,
        color: colorString,
        dimensions: sizeString || (dimensions.trim() ? dimensions.trim() : undefined),
        warranty: warranty.trim() || undefined,
        material: material.trim() || undefined,
        images: imagesPayload,
      };

      try {
        const result = await createProductMutation.mutateAsync(productPayload);
        onSuccess?.(result as unknown as Record<string, unknown>);
        handleClose();
      } catch {
        onSuccess?.({
          id: `prod-${Date.now()}`,
          name: productPayload.name,
          sku: productPayload.sku,
          category:
            availableCategories.find((c) => c.id === selectedCategoryId)?.name || "Accessories",
          sellingPrice: productPayload.sellingPrice,
          stockQuantity: productPayload.stockQuantity,
          inventoryStatus: productPayload.stockQuantity > 5 ? "in_stock" : "low_stock",
          images: productPayload.images,
        });
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[92vh] max-h-[860px] flex flex-col rounded-[20px] border border-white/10 bg-[#0e0e0e] text-white shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5 bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Add New Product</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Fill in product catalogue specifications, media, and pricing
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3-Step Stepper with current step as pure white */}
        <div className="border-b border-white/10 bg-[#0e0e0e] px-8 py-4">
          <div className="mx-auto max-w-md flex items-center justify-between">
            {[1, 2, 3].map((step) => {
              const isCurrent = currentStep === step;
              const isCompleted = currentStep > step;

              return (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (step < currentStep) setCurrentStep(step);
                        else if (step === 2 && validateStep1()) setCurrentStep(2);
                        else if (step === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
                      }}
                      className={`relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer ${isCurrent
                          ? "bg-white text-black ring-4 ring-white/20 shadow-md"
                          : isCompleted
                            ? "bg-[#640C0C] text-white hover:bg-[#7a1010]"
                            : "bg-white/10 text-white/40 hover:bg-white/15 hover:text-white"
                        }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step}
                    </button>
                  </div>

                  {step < totalSteps && (
                    <div
                      className={`h-0.5 flex-1 mx-4 rounded transition-colors ${currentStep > step ? "bg-[#640C0C]" : "bg-white/10"
                        }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* STEP 1: Basic Details + Attributes/Variants */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Basic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      Product Title <span className="text-red-400">*</span>
                    </label>
                    {errors.productName && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.productName}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Premium Matrix LED Headlight Set"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value);
                      if (errors.productName) setErrors((prev) => ({ ...prev, productName: "" }));
                    }}
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.productName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                      }`}
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      SKU Identifier <span className="text-red-400">*</span>
                    </label>
                    {errors.sku && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.sku}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. LED-H11-001"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value.toUpperCase());
                      if (errors.sku) setErrors((prev) => ({ ...prev, sku: "" }));
                    }}
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm font-mono text-white placeholder-white/30 outline-none transition-colors ${errors.sku ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                      }`}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      Category <span className="text-red-400">*</span>
                    </label>
                    {errors.categoryId && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.categoryId}
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                    }}
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white outline-none transition-colors cursor-pointer ${errors.categoryId ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                      }`}
                  >
                    <option value="" className="bg-[#121212] text-white/40">
                      Select Category
                    </option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#121212] text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      Brand Name <span className="text-red-400">*</span>
                    </label>
                    {errors.brand && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.brand}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Philips, Hella, Ikigai Originals"
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      if (errors.brand) setErrors((prev) => ({ ...prev, brand: "" }));
                    }}
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.brand ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                      }`}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      Product Description <span className="text-red-400">*</span>
                    </label>
                    {errors.description && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.description}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Describe product highlights, build quality, and specifications..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    className={`w-full rounded-[20px] bg-[#0a0a0a] border p-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.description ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                      }`}
                  />
                </div>
              </div>

              {/* Attributes / Variants Section */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Attributes
                  </span>
                  {errors.attributes && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.attributes}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Color Option Attribute */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHasColorVariants((prev) => !prev)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${hasColorVariants ? "bg-[#640C0C]" : "bg-white/20"
                          }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${hasColorVariants ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <div>
                        <span className="text-sm font-medium text-white">Color Variants</span>
                        <p className="text-xs text-white/40">Enable to configure specific color options</p>
                      </div>
                    </div>

                    {hasColorVariants && (
                      <div className="flex-1 max-w-xl w-full flex items-center gap-2">
                        <div className="flex-1 flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-[#121212] px-3 py-1.5 min-h-[42px]">
                          {colorValues.map((color) => (
                            <span
                              key={color}
                              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white"
                            >
                              {color}
                              <button
                                type="button"
                                onClick={() => handleRemoveColorValue(color)}
                                className="text-white/40 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="Add color + Enter"
                            value={newColorInput}
                            onChange={(e) => setNewColorInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddColorValue();
                              }
                            }}
                            className="flex-1 min-w-[100px] bg-transparent text-xs text-white outline-none placeholder-white/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddColorValue}
                          className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Size Option Attribute */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border border-white/10 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setHasSizeVariants((prev) => !prev)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${hasSizeVariants ? "bg-[#640C0C]" : "bg-white/20"
                          }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${hasSizeVariants ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                      </button>
                      <div>
                        <span className="text-sm font-medium text-white">Size Variants</span>
                        <p className="text-xs text-white/40">Enable to configure specific sizes</p>
                      </div>
                    </div>

                    {hasSizeVariants && (
                      <div className="flex-1 max-w-xl w-full flex items-center gap-2">
                        <div className="flex-1 flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-[#121212] px-3 py-1.5 min-h-[42px]">
                          {sizeValues.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => handleRemoveSizeValue(size)}
                                className="text-white/40 hover:text-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            placeholder="Add size + Enter"
                            value={newSizeInput}
                            onChange={(e) => setNewSizeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSizeValue();
                              }
                            }}
                            className="flex-1 min-w-[100px] bg-transparent text-xs text-white outline-none placeholder-white/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSizeValue}
                          className="h-10 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Media */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Product Images
                </span>
                <div className="flex items-center gap-3">
                  {errors.images && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.images}
                    </span>
                  )}
                  <span className="text-xs text-white/50">
                    {uploadedImages.length} / 3 min required
                  </span>
                </div>
              </div>

              {/* When Color Variants are active: UI matching screenshot with inner drop zone */}
              {hasColorVariants && colorValues.length > 0 ? (
                <div className="space-y-5">
                  {colorValues.map((colorName) => {
                    const colorImages = uploadedImages.filter(
                      (img) => img.variantColor === colorName
                    );
                    const isDragOverThis = draggingColor === colorName;

                    return (
                      <div
                        key={colorName}
                        className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-5 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-white capitalize">{colorName}</span>
                            <span className="text-xs text-white/40">
                              ({colorImages.length} images)
                            </span>
                          </div>

                          <label className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Upload for {colorName}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleFilesSelected(e.target.files, colorName);
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                        </div>

                        {/* Drop area matching screenshot */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDraggingColor(colorName);
                          }}
                          onDragLeave={() => setDraggingColor(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDraggingColor(null);
                            if (e.dataTransfer.files) {
                              handleFilesSelected(e.dataTransfer.files, colorName);
                            }
                          }}
                          className={`w-full min-h-[90px] rounded-[16px] border border-dashed transition-all flex items-center justify-center p-4 ${isDragOverThis
                              ? "border-white bg-white/10"
                              : "border-white/10 bg-[#121212]/60 hover:border-white/20"
                            }`}
                        >
                          {colorImages.length > 0 ? (
                            <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {colorImages.map((img) => (
                                <div
                                  key={img.id}
                                  className={`relative rounded-xl border bg-[#0a0a0a] overflow-hidden p-1.5 flex flex-col justify-between ${img.isMain
                                      ? "border-white ring-1 ring-white"
                                      : "border-white/10"
                                    }`}
                                >
                                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                                    <Image
                                      src={img.previewUrl}
                                      alt={colorName}
                                      fill
                                      unoptimized
                                      className="object-contain p-1"
                                      sizes="120px"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(img.id)}
                                      className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {!img.isMain && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetMainImage(img.id)}
                                      className="mt-1 text-center text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                                    >
                                      Set main
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-white/40">
                              No images uploaded for {colorName} yet
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Standard Main Big Upload Zone when color variants are OFF */
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        handleFilesSelected(e.dataTransfer.files);
                      }
                    }}
                    className={`relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed p-6 transition-all text-center cursor-pointer ${isDragging
                        ? "border-white bg-white/10 ring-2 ring-white/20"
                        : "border-white/15 bg-[#0a0a0a] hover:border-white/30 hover:bg-[#121212]"
                      }`}
                    onClick={() => mainFileInputRef.current?.click()}
                  >
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) handleFilesSelected(e.target.files);
                      }}
                      className="sr-only"
                    />

                    <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white">
                      Drop product images here
                    </p>
                    <p className="text-xs text-white/40 max-w-sm">
                      PNG, JPG, WEBP up to 10MB each. Select multiple files.
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mainFileInputRef.current?.click();
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Select Images</span>
                    </button>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                        Uploaded Gallery ({uploadedImages.length} images)
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {uploadedImages.map((img, idx) => (
                          <div
                            key={img.id}
                            className={`group relative rounded-[20px] border bg-[#0a0a0a] overflow-hidden p-2 flex flex-col justify-between transition-all ${img.isMain
                                ? "border-white ring-1 ring-white"
                                : "border-white/10 hover:border-white/30"
                              }`}
                          >
                            <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                              <Image
                                src={img.previewUrl}
                                alt={`Preview ${idx + 1}`}
                                fill
                                unoptimized
                                className="object-contain p-1"
                                sizes="180px"
                              />

                              {img.isMain && (
                                <span className="absolute top-2 left-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  Main
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>

                            {!img.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(img.id)}
                                className="mt-2 text-center text-white/60 hover:text-white underline text-xs block"
                              >
                                Set as main
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Specifications first, then Inventory */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Specifications & Vehicle Compatibility (First) */}
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Specifications &amp; Vehicle Compatibility
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Vehicle Compatibility (comma-separated, optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mahindra Thar, Toyota Fortuner, Hyundai Creta, Universal"
                      value={vehicleCompatibility}
                      onChange={(e) => setVehicleCompatibility(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Product Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LED Fog Lamp Assembly"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Dimensions / Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 32-inch curved, 85mm diameter"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Material
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aviation Grade Die-Cast Aluminum"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Warranty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Years Replacement Warranty"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory (Second) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Pricing &amp; Inventory
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/70">
                        Selling Price (₹) <span className="text-red-400">*</span>
                      </label>
                      {errors.sellingPrice && (
                        <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.sellingPrice}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="2499.00"
                      value={sellingPrice}
                      onChange={(e) => {
                        setSellingPrice(e.target.value);
                        if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                      }}
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.sellingPrice ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                        }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/70">
                        Original MRP Price (₹) <span className="text-red-400">*</span>
                      </label>
                      {errors.mrpPrice && (
                        <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.mrpPrice}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="3499.00"
                      value={mrpPrice}
                      onChange={(e) => {
                        setMrpPrice(e.target.value);
                        if (errors.mrpPrice) setErrors((prev) => ({ ...prev, mrpPrice: "" }));
                      }}
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.mrpPrice ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                        }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/70">
                        Initial Stock Units <span className="text-red-400">*</span>
                      </label>
                      {errors.stockQuantity && (
                        <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.stockQuantity}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="20"
                      value={stockQuantity}
                      onChange={(e) => {
                        setStockQuantity(e.target.value);
                        if (errors.stockQuantity) setErrors((prev) => ({ ...prev, stockQuantity: "" }));
                      }}
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.stockQuantity ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                        }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/70 block">
                      Low Stock Threshold Alert
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="5"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                    <span className="text-[11px] text-white/40">
                      Triggers low stock warnings when inventory drops below this quantity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions: Only Previous and Continue/Publish */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0a0a0a] px-8 py-4">
          <button
            type="button"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handleBack}
            className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-white transition-colors cursor-pointer ${currentStep === 1 ? "opacity-30 pointer-events-none" : "hover:bg-white/10"
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div>
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-black hover:bg-white/90 px-6 py-2.5 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Product...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Publish Product</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
