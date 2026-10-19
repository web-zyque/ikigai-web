"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCategories, useCreateProduct } from "@/hooks/use-products";
import { uploadApi } from "@/services/upload.service";

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

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadedImageItem {
  id: string;
  file?: File;
  previewUrl: string;
  isMain: boolean;
  variantColor?: string;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  cloudinaryUrl?: string;
  publicId?: string;
  uploadError?: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { data: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const availableCategories = apiCategories && apiCategories.length > 0 ? apiCategories : [];

  const createProductMutation = useCreateProduct();

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
    // Revoke all pending object URLs to avoid memory leaks
    uploadedImages.forEach((img) => {
      if (img.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
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
      // Clear color variant error if adding a value
      if (errors.colorVariants) {
        setErrors((prev) => ({ ...prev, colorVariants: "" }));
      }
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
      // Clear size variant error if adding a value
      if (errors.sizeVariants) {
        setErrors((prev) => ({ ...prev, sizeVariants: "" }));
      }
    }
  };

  const handleRemoveSizeValue = (val: string) => {
    setSizeValues((prev) => prev.filter((s) => s !== val));
  };

  const uploadImageToServer = useCallback(async (itemId: string, file: File) => {
    setUploadedImages((prev) =>
      prev.map((img) =>
        img.id === itemId
          ? { ...img, uploadStatus: 'uploading' as UploadStatus, uploadProgress: 0, uploadError: undefined }
          : img,
      ),
    );

    try {
      const result = await uploadApi.uploadImage(file, (percent) => {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === itemId ? { ...img, uploadProgress: percent } : img,
          ),
        );
      });

      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === itemId
            ? {
                ...img,
                uploadStatus: 'done' as UploadStatus,
                uploadProgress: 100,
                cloudinaryUrl: result.imageUrl,
                publicId: result.publicId,
                uploadError: undefined,
              }
            : img,
        ),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please retry.';
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === itemId
            ? {
                ...img,
                uploadStatus: 'error' as UploadStatus,
                uploadProgress: 0,
                uploadError: message,
              }
            : img,
        ),
      );
    }
  }, []);

  const handleFilesSelected = useCallback((files: FileList | File[], variantColor?: string) => {
    const ALLOWED = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
    const fileArray = Array.from(files).filter((file) => ALLOWED.has(file.type));
    if (fileArray.length === 0) return;

    const newItems: UploadedImageItem[] = fileArray.map((file, idx) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: false, // will be set below
      variantColor,
      uploadStatus: 'pending' as UploadStatus,
      uploadProgress: 0,
    }));

    setUploadedImages((prev) => {
      const combined = [...prev, ...newItems];
      // Ensure there is exactly one main image
      const hasMain = combined.some((img) => img.isMain);
      if (!hasMain && combined.length > 0) {
        combined[0] = { ...combined[0], isMain: true };
      }
      return combined;
    });

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });

    // Start uploading each new item immediately
    newItems.forEach((item) => {
      if (item.file) {
        uploadImageToServer(item.id, item.file);
      }
    });
  }, [uploadImageToServer]);

  const handleRemoveImage = (idToRemove: string) => {
    setUploadedImages((prev) => {
      const removing = prev.find((img) => img.id === idToRemove);
      if (removing?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(removing.previewUrl);
      }
      const filtered = prev.filter((item) => item.id !== idToRemove);
      if (filtered.length > 0 && !filtered.some((item) => item.isMain)) {
        filtered[0] = { ...filtered[0], isMain: true };
      }
      return filtered;
    });
  };

  const handleRetryUpload = (id: string) => {
    const item = uploadedImages.find((img) => img.id === id);
    if (item?.file) {
      uploadImageToServer(id, item.file);
    }
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
    
    // Required field validations (after trimming)
    if (!productName.trim()) {
      newErrors.productName = "Product title is required";
    }
    
    if (!sku.trim()) {
      newErrors.sku = "SKU identifier is required";
    }
    
    if (!selectedCategoryId) {
      newErrors.categoryId = "Category selection is required";
    } else if (availableCategories.length > 0 && !availableCategories.find(cat => cat.id === selectedCategoryId)) {
      // Validate that selected category exists in actual backend categories
      newErrors.categoryId = "Please select a valid category from the list";
    }
    
    if (!brand.trim()) {
      newErrors.brand = "Brand name is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Product description is required";
    }

    // Variant validations
    if (hasColorVariants && colorValues.length === 0) {
      newErrors.colorVariants = "Please add at least one color when color variants are enabled";
    }
    
    if (hasSizeVariants && sizeValues.length === 0) {
      newErrors.sizeVariants = "Please add at least one size when size variants are enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (uploadedImages.length < 3) {
      newErrors.images = `Minimum 3 images are required. Currently uploaded: ${uploadedImages.length}.`;
    } else {
      const inFlight = uploadedImages.filter(
        (img) => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading',
      );
      if (inFlight.length > 0) {
        newErrors.images = `${inFlight.length} image(s) are still uploading. Please wait.`;
      } else {
        const failed = uploadedImages.filter((img) => img.uploadStatus === 'error');
        if (failed.length > 0) {
          newErrors.images = `${failed.length} image(s) failed to upload. Please retry or remove them.`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Selling Price - Required and must be positive
    if (!sellingPrice.trim()) {
      newErrors.sellingPrice = "Selling price is required";
    } else {
      const price = parseFloat(sellingPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.sellingPrice = "Selling price must be greater than zero";
      }
    }
    
    // MRP Price - Optional, but if provided must be positive
    if (mrpPrice.trim()) {
      const price = parseFloat(mrpPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.mrpPrice = "MRP price must be a valid positive number";
      }
    }
    
    // Stock Quantity - Optional (defaults to 0), if provided must be non-negative
    if (stockQuantity !== "" && stockQuantity !== undefined) {
      const qty = Number(stockQuantity);
      if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
        newErrors.stockQuantity = "Stock quantity must be a non-negative whole number";
      }
    }
    
    // Low Stock Threshold - Optional (defaults to 5), if provided must be >= 1
    if (lowStockThreshold !== "" && lowStockThreshold !== undefined) {
      const threshold = Number(lowStockThreshold);
      if (isNaN(threshold) || threshold < 1 || !Number.isInteger(threshold)) {
        newErrors.lowStockThreshold = "Low stock threshold must be a whole number of at least 1";
      }
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
      // All images must already be uploaded (validated above). Use their cloudinaryUrl.
      const imagesPayload = uploadedImages.map((img, idx) => ({
        imageUrl: img.cloudinaryUrl ?? img.previewUrl,
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
        mrpPrice: mrpPrice.trim() ? parseFloat(mrpPrice) : undefined,
        stockQuantity: stockQuantity === "" || stockQuantity === undefined ? 0 : Number(stockQuantity),
        lowStockThreshold: lowStockThreshold === "" || lowStockThreshold === undefined ? 5 : Number(lowStockThreshold),
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

      const result = await createProductMutation.mutateAsync(productPayload);
      onSuccess?.(result as unknown as Record<string, unknown>);
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create product.';
      setErrors((prev) => ({ ...prev, submit: message }));
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
                  {categoriesError ? (
                    <div className="w-full h-12 rounded-full bg-red-500/10 border border-red-500/30 px-4 flex items-center text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5 mr-2" />
                      Failed to load categories. Please refresh the page.
                    </div>
                  ) : categoriesLoading ? (
                    <div className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 flex items-center text-xs text-white/40">
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                      }}
                      disabled={availableCategories.length === 0}
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${errors.categoryId ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                        }`}
                    >
                      <option value="" className="bg-[#121212] text-white/40">
                        {availableCategories.length === 0 ? "No categories available" : "Select Category"}
                      </option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[#121212] text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                  {(errors.colorVariants || errors.sizeVariants) && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> 
                      {errors.colorVariants || errors.sizeVariants}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Color Option Attribute */}
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border bg-[#0a0a0a] ${errors.colorVariants ? "border-red-500/30" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasColorVariants((prev) => !prev);
                          if (errors.colorVariants) setErrors((prev) => ({ ...prev, colorVariants: "" }));
                        }}
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
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border bg-[#0a0a0a] ${errors.sizeVariants ? "border-red-500/30" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasSizeVariants((prev) => !prev);
                          if (errors.sizeVariants) setErrors((prev) => ({ ...prev, sizeVariants: "" }));
                        }}
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
                            className={`group relative rounded-[20px] border bg-[#0a0a0a] overflow-hidden p-2 flex flex-col justify-between transition-all ${
                              img.uploadStatus === 'error'
                                ? "border-red-500/50"
                                : img.isMain
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

                              {img.isMain && img.uploadStatus === 'done' && (
                                <span className="absolute top-2 left-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  Main
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="absolute top-2 right-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>

                              {(img.uploadStatus === 'uploading' || img.uploadStatus === 'pending') && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
                                  <Loader2 className="h-5 w-5 animate-spin text-white mb-1" />
                                  <span className="text-[10px] text-white/80">{img.uploadProgress}%</span>
                                  <div className="absolute bottom-0 left-0 h-0.5 bg-white/80 transition-all duration-200" style={{ width: `${img.uploadProgress}%` }} />
                                </div>
                              )}

                              {img.uploadStatus === 'error' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 rounded-xl gap-1 p-2">
                                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                  <span className="text-[10px] text-red-300 text-center leading-tight line-clamp-2">{img.uploadError ?? 'Upload failed'}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRetryUpload(img.id)}
                                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-600/80 hover:bg-red-500 px-2 py-0.5 text-[10px] text-white cursor-pointer"
                                  >
                                    <RefreshCw className="h-2.5 w-2.5" />
                                    Retry
                                  </button>
                                </div>
                              )}

                              {img.uploadStatus === 'done' && (
                                <div className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>

                            {!img.isMain && img.uploadStatus === 'done' && (
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
                        Original MRP Price (₹)
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
                      placeholder="3499.00 (optional)"
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
                        Initial Stock Units
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
                      placeholder="0 (defaults to 0 if empty)"
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-white/70 block">
                        Low Stock Threshold Alert
                      </label>
                      {errors.lowStockThreshold && (
                        <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3 w-3" /> {errors.lowStockThreshold}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      placeholder="5 (defaults to 5 if empty)"
                      value={lowStockThreshold}
                      onChange={(e) => {
                        setLowStockThreshold(e.target.value);
                        if (errors.lowStockThreshold) setErrors((prev) => ({ ...prev, lowStockThreshold: "" }));
                      }}
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.lowStockThreshold ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                        }`}
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

          <div className="flex flex-col items-end gap-1">
            {errors.submit && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.submit}
              </span>
            )}
            {currentStep < totalSteps ? (
              (() => {
                const uploadsInFlight = currentStep === 2
                  ? uploadedImages.some((img) => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading')
                  : false;
                return (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={uploadsInFlight}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white text-black hover:bg-white/90 px-6 py-2.5 text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadsInFlight ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                );
              })()
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

