"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Trash2,
} from "lucide-react";
import { useCategories, useUpdateProduct } from "@/hooks/use-products";
import { uploadApi } from "@/services/upload.service";
import { ProductResponse } from "@/types/products.types";
import { normalizeColorName, parseColorString, getColorInfo } from "@/lib/color-utils";

export interface EditProductModalProps {
  isOpen: boolean;
  product: ProductResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

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
  existingImageId?: string; // Track existing images from backend
}

export default function EditProductModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const { data: apiCategories, isLoading: categoriesLoading } = useCategories();
  const availableCategories = apiCategories && apiCategories.length > 0 ? apiCategories : [];

  const updateProductMutation = useUpdateProduct();

  // Step 1: Basic details
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  // Step 1 Attributes / Variants
  const [hasColorVariants, setHasColorVariants] = useState(false);
  const [colorValues, setColorValues] = useState<string[]>([]);
  const [newColorInput, setNewColorInput] = useState("");

  // Step 2: Images
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingColor, setDraggingColor] = useState<string | null>(null);

  // Step 3: Pricing, Inventory, Specifications
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number | string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>("5");
  const [vehicleCompatibility, setVehicleCompatibility] = useState("");
  const [productType, setProductType] = useState("");
  const [color, setColor] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [warranty, setWarranty] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Color management functions
  const handleAddColorValue = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    
    // Case-insensitive duplicate check
    const normalized = normalizeColorName(trimmed);
    const isDuplicate = colorValues.some(c => normalizeColorName(c) === normalized);
    
    if (!isDuplicate) {
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
    // Remove images associated with this color
    setUploadedImages((prev) => prev.filter((img) => img.variantColor !== val));
  };

  // Prepopulate form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setProductName(product.name);
      setSku(product.sku);
      setSelectedCategoryId(product.category.id);
      setBrand(product.brand || "");
      setDescription(product.description || "");
      
      // Populate color variants if they exist
      if (product.variants && product.variants.length > 0) {
        setHasColorVariants(true);
        const colors = product.variants.map(v => v.colorName);
        setColorValues(colors);
        
        // Populate images from variants
        const existingImages: UploadedImageItem[] = [];
        product.variants.forEach((variant) => {
          variant.images.forEach((img) => {
            existingImages.push({
              id: img.id,
              existingImageId: img.id,
              previewUrl: img.imageUrl,
              cloudinaryUrl: img.imageUrl,
              publicId: img.cloudinaryPublicId,
              isMain: img.isMainImage,
              variantColor: variant.colorName,
              uploadStatus: 'done' as UploadStatus,
              uploadProgress: 100,
            });
          });
        });
        setUploadedImages(existingImages);
      } else {
        // No variants - populate images without color assignment
        setHasColorVariants(false);
        setColorValues([]);
        const existingImages: UploadedImageItem[] = product.images.map((img) => ({
          id: img.id,
          existingImageId: img.id,
          previewUrl: img.imageUrl,
          cloudinaryUrl: img.imageUrl,
          publicId: img.cloudinaryPublicId,
          isMain: img.isMainImage,
          uploadStatus: 'done' as UploadStatus,
          uploadProgress: 100,
        }));
        setUploadedImages(existingImages);
      }

      setSellingPrice(product.sellingPrice);
      setMrpPrice(product.mrpPrice || "");
      setStockQuantity(product.stockQuantity);
      setLowStockThreshold(product.lowStockThreshold);
      setVehicleCompatibility(product.vehicleCompatibility?.join(", ") || "");
      setProductType(product.productType || "");
      setColor(product.color || "");
      setDimensions(product.dimensions || "");
      setMaterial(product.material || "");
      setWarranty(product.warranty || "");
    }
  }, [product, isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    // Revoke all pending object URLs
    uploadedImages.forEach((img) => {
      if (img.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setCurrentStep(1);
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
      const message = err instanceof Error ? err.message : 'Upload failed. Please retry.';
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
      isMain: false,
      variantColor,
      uploadStatus: 'pending' as UploadStatus,
      uploadProgress: 0,
    }));

    setUploadedImages((prev) => {
      const combined = [...prev, ...newItems];
      
      if (variantColor) {
        // For color variants: ensure each color has exactly one main image
        const colorImages = combined.filter(img => img.variantColor === variantColor);
        const hasMainForColor = colorImages.some(img => img.isMain);
        if (!hasMainForColor && colorImages.length > 0) {
          // Set first image of this color as main
          const firstColorImage = colorImages[0];
          const idx = combined.findIndex(img => img.id === firstColorImage.id);
          if (idx !== -1) {
            combined[idx] = { ...combined[idx], isMain: true };
          }
        }
      } else {
        // No variants: ensure one main image
        const hasMain = combined.some((img) => img.isMain);
        if (!hasMain && combined.length > 0) {
          combined[0] = { ...combined[0], isMain: true };
        }
      }
      
      return combined;
    });

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.images;
      return copy;
    });

    // Start uploading
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
      
      if (removing?.variantColor) {
        // For color variants: if removed image was main, promote next image of same color
        if (removing.isMain) {
          const sameColorImages = filtered.filter(img => img.variantColor === removing.variantColor);
          if (sameColorImages.length > 0) {
            const idx = filtered.findIndex(img => img.id === sameColorImages[0].id);
            if (idx !== -1) {
              filtered[idx] = { ...filtered[idx], isMain: true };
            }
          }
        }
      } else {
        // No variants: if removed was main, promote first image
        if (filtered.length > 0 && !filtered.some((item) => item.isMain)) {
          filtered[0] = { ...filtered[0], isMain: true };
        }
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
    setUploadedImages((prev) => {
      const targetImage = prev.find(img => img.id === id);
      if (!targetImage) return prev;
      
      return prev.map((item) => {
        if (targetImage.variantColor) {
          // For color variants: only affect images of the same color
          if (item.variantColor === targetImage.variantColor) {
            return { ...item, isMain: item.id === id };
          }
          return item;
        } else {
          // No variants: affect all images
          return { ...item, isMain: item.id === id };
        }
      });
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!productName.trim()) newErrors.productName = "Product title is required";
    if (!sku.trim()) newErrors.sku = "SKU identifier is required";
    if (!selectedCategoryId) newErrors.categoryId = "Category selection is required";
    if (!brand.trim()) newErrors.brand = "Brand name is required";
    if (!description.trim()) newErrors.description = "Product description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check if color variants are enabled
    if (hasColorVariants && colorValues.length > 0) {
      // Group images by color
      const imagesByColor: Record<string, typeof uploadedImages> = {};
      uploadedImages.forEach(img => {
        if (img.variantColor) {
          if (!imagesByColor[img.variantColor]) {
            imagesByColor[img.variantColor] = [];
          }
          imagesByColor[img.variantColor].push(img);
        }
      });
      
      const failedColors: string[] = [];
      
      colorValues.forEach(color => {
        const colorImages = imagesByColor[color] || [];
        const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
        const uploading = colorImages.filter(img => img.uploadStatus === 'uploading' || img.uploadStatus === 'pending');
        const failed = colorImages.filter(img => img.uploadStatus === 'error');
        
        if (uploading.length > 0) {
          failedColors.push(`${color}: ${uploading.length} uploading`);
        } else if (failed.length > 0) {
          failedColors.push(`${color}: ${failed.length} failed`);
        } else if (doneImages.length < 3) {
          failedColors.push(`${color}: needs ${3 - doneImages.length} more`);
        }
      });
      
      if (failedColors.length > 0) {
        newErrors.images = `Issues: ${failedColors.join('; ')}`;
      }
    } else {
      // No color variants - validate overall images
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!sellingPrice.trim()) {
      newErrors.sellingPrice = "Selling price is required";
    } else {
      const price = parseFloat(sellingPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.sellingPrice = "Selling price must be greater than zero";
      }
    }
    
    if (mrpPrice.trim()) {
      const price = parseFloat(mrpPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.mrpPrice = "MRP price must be a valid positive number";
      }
    }
    
    if (stockQuantity !== "" && stockQuantity !== undefined) {
      const qty = Number(stockQuantity);
      if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
        newErrors.stockQuantity = "Stock quantity must be a non-negative whole number";
      }
    }
    
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

  // Check if Step 2 (images) is ready to proceed
  const isStep2Valid = useMemo(() => {
    if (hasColorVariants && colorValues.length > 0) {
      // Group images by color
      const imagesByColor: Record<string, typeof uploadedImages> = {};
      uploadedImages.forEach(img => {
        if (img.variantColor) {
          if (!imagesByColor[img.variantColor]) {
            imagesByColor[img.variantColor] = [];
          }
          imagesByColor[img.variantColor].push(img);
        }
      });
      
      // Check each color has minimum 3 successfully uploaded images
      for (const color of colorValues) {
        const colorImages = imagesByColor[color] || [];
        const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
        const uploading = colorImages.filter(img => img.uploadStatus === 'uploading' || img.uploadStatus === 'pending');
        const failed = colorImages.filter(img => img.uploadStatus === 'error');
        
        // If any images are still uploading or failed, not valid
        if (uploading.length > 0 || failed.length > 0) {
          return false;
        }
        
        // If less than 3 done images, not valid
        if (doneImages.length < 3) {
          return false;
        }
      }
      
      return true;
    } else {
      // No color variants - check overall images
      if (uploadedImages.length < 3) return false;
      
      const allDone = uploadedImages.every(img => img.uploadStatus === 'done');
      return allDone;
    }
  }, [uploadedImages, hasColorVariants, colorValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setIsSubmitting(true);
    try {
      const colorString =
        hasColorVariants && colorValues.length > 0 ? colorValues.join(", ") : undefined;

      // Build images payload with variantColor property
      const imagesPayload = uploadedImages.map((img, idx) => ({
        imageUrl: img.cloudinaryUrl ?? img.previewUrl,
        cloudinaryPublicId: img.publicId,
        isMainImage: img.isMain,
        displayOrder: idx + 1,
        altText: img.variantColor ? `${productName} (${img.variantColor})` : productName,
        variantColor: img.variantColor, // Include variantColor for backend
      }));

      const vehicleCompatibilityArray = vehicleCompatibility
        ? vehicleCompatibility.split(",").map((v) => v.trim()).filter((v) => v.length > 0)
        : undefined;

      const productPayload: any = {
        name: productName.trim(),
        sku: sku.trim(),
        categoryId: selectedCategoryId,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        sellingPrice: parseFloat(sellingPrice),
        mrpPrice: mrpPrice.trim() ? parseFloat(mrpPrice) : undefined,
        stockQuantity: stockQuantity === "" || stockQuantity === undefined ? 0 : Number(stockQuantity),
        lowStockThreshold: lowStockThreshold === "" || lowStockThreshold === undefined ? 5 : Number(lowStockThreshold),
        vehicleCompatibility: vehicleCompatibilityArray,
        productType: productType.trim() || undefined,
        color: colorString || color.trim() || undefined,
        dimensions: dimensions.trim() || undefined,
        warranty: warranty.trim() || undefined,
        material: material.trim() || undefined,
        images: imagesPayload,
      };

      await updateProductMutation.mutateAsync({ id: product.id, data: productPayload });
      onSuccess?.();
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update product.';
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

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
            <h2 className="text-lg font-bold tracking-tight text-white">Edit Product</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Update product details, media, and pricing
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

        {/* 3-Step Stepper */}
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
                      className={`relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
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
                      className={`h-0.5 flex-1 mx-4 rounded transition-colors ${
                        currentStep > step ? "bg-[#640C0C]" : "bg-white/10"
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
          {/* STEP 1: Basic Details */}
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
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                      errors.productName ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
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
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm font-mono text-white placeholder-white/30 outline-none transition-colors ${
                      errors.sku ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
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
                  {categoriesLoading ? (
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
                      className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white outline-none transition-colors cursor-pointer ${
                        errors.categoryId ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
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
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                      errors.brand ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
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
                    className={`w-full rounded-[20px] bg-[#0a0a0a] border p-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                      errors.description ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                    }`}
                  />
                </div>

                {/* Color Variants Toggle */}
                <div className="md:col-span-2 border-t border-white/5 pt-5 mt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
                          {colorValues.map((color) => {
                            const colorInfo = getColorInfo(color);
                            return (
                              <span
                                key={color}
                                className="inline-flex items-center gap-1.5 bg-white/10 rounded-full pl-2.5 pr-1 py-0.5 text-xs text-white"
                              >
                                <span
                                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: colorInfo.hex }}
                                />
                                {color}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorValue(color)}
                                  className="ml-0.5 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            );
                          })}
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
                            className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs text-white placeholder-white/40 px-1 py-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.colorVariants && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.colorVariants}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Product Images */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Product Images
                </h3>
                {errors.images && (
                  <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" /> {errors.images}
                  </span>
                )}
              </div>

              {/* When Color Variants are active: show per-color upload zones */}
              {hasColorVariants && colorValues.length > 0 ? (
                <div className="space-y-5">
                  {colorValues.map((colorName) => {
                    const colorImages = uploadedImages.filter(
                      (img) => img.variantColor === colorName
                    );
                    const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
                    const uploadingImages = colorImages.filter(img => img.uploadStatus === 'uploading' || img.uploadStatus === 'pending');
                    const failedImages = colorImages.filter(img => img.uploadStatus === 'error');
                    
                    const colorInfo = getColorInfo(colorName);
                    
                    let statusBadge = null;
                    if (uploadingImages.length > 0) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Uploading {uploadingImages.length}
                        </span>
                      );
                    } else if (failedImages.length > 0) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                          <AlertCircle className="w-3 h-3" />
                          {failedImages.length} failed
                        </span>
                      );
                    } else if (doneImages.length >= 3) {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                          <Check className="w-3 h-3" />
                          Complete
                        </span>
                      );
                    } else if (doneImages.length > 0) {
                      statusBadge = (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                          {doneImages.length}/3 uploaded
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 font-medium">
                          0/3 uploaded
                        </span>
                      );
                    }

                    return (
                      <div
                        key={colorName}
                        className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-5"
                      >
                        {/* Color Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-5 h-5 rounded-full border-2 border-white/30 shrink-0"
                              style={{ backgroundColor: colorInfo.hex }}
                            />
                            <span className="text-sm font-semibold text-white">{colorName}</span>
                          </div>
                          {statusBadge}
                        </div>

                        {/* Inner drop zone per color */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDraggingColor(colorName);
                          }}
                          onDragLeave={(e) => {
                            e.stopPropagation();
                            setDraggingColor(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDraggingColor(null);
                            if (e.dataTransfer.files) {
                              handleFilesSelected(e.dataTransfer.files, colorName);
                            }
                          }}
                          className={`relative rounded-xl border-2 border-dashed p-4 transition-colors cursor-pointer mb-4 ${
                            draggingColor === colorName
                              ? "border-[#640C0C] bg-[#640C0C]/10"
                              : "border-white/20 bg-black/20 hover:border-white/40"
                          }`}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.multiple = true;
                            input.accept = "image/jpeg,image/jpg,image/png,image/webp";
                            input.onchange = (e: Event) => {
                              const target = e.target as HTMLInputElement;
                              if (target.files) handleFilesSelected(target.files, colorName);
                            };
                            input.click();
                          }}
                        >
                          <div className="flex flex-col items-center justify-center py-4">
                            <ImageIcon className="h-8 w-8 text-white/40 mb-2" />
                            <p className="text-xs font-medium text-white/80 mb-0.5">
                              Drop images for {colorName} or click to upload
                            </p>
                            <p className="text-[10px] text-white/40">
                              Minimum 3 images required
                            </p>
                          </div>
                        </div>

                        {/* Images Grid for this color */}
                        {colorImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {colorImages.map((img) => (
                              <div
                                key={img.id}
                                className="relative aspect-square rounded-xl border border-white/10 bg-black overflow-hidden group"
                              >
                                <Image
                                  src={img.previewUrl}
                                  alt={colorName}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />

                                {/* Upload Progress */}
                                {img.uploadStatus === 'uploading' && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-center">
                                      <Loader2 className="h-5 w-5 text-white animate-spin mx-auto mb-1" />
                                      <p className="text-[10px] text-white">{img.uploadProgress}%</p>
                                    </div>
                                  </div>
                                )}

                                {/* Upload Error */}
                                {img.uploadStatus === 'error' && (
                                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRetryUpload(img.id)}
                                      className="flex flex-col items-center gap-1 p-2 bg-black/60 rounded-lg"
                                    >
                                      <RefreshCw className="h-4 w-4 text-white" />
                                      <span className="text-[10px] text-white">Retry</span>
                                    </button>
                                  </div>
                                )}

                                {/* Actions Overlay */}
                                {img.uploadStatus === 'done' && (
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSetMainImage(img.id)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                                        img.isMain
                                          ? "bg-white text-black"
                                          : "bg-white/20 text-white hover:bg-white/30"
                                      }`}
                                    >
                                      {img.isMain ? "Main" : "Set"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(img.id)}
                                      className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}

                                {/* Main Badge */}
                                {img.isMain && img.uploadStatus === 'done' && (
                                  <div className="absolute top-1.5 left-1.5 bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    Main
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
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
                    className={`relative flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-8 transition-colors cursor-pointer ${
                      isDragging
                        ? "border-[#640C0C] bg-[#640C0C]/10"
                        : "border-white/20 bg-[#0a0a0a] hover:border-white/40"
                    }`}
                    onClick={() => mainFileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-white/40 mb-3" />
                    <p className="text-sm font-medium text-white/80 mb-1">
                      Drop images here or click to browse
                    </p>
                    <p className="text-xs text-white/40">
                      Supports JPEG, PNG, WEBP · Minimum 3 images required
                    </p>
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files) handleFilesSelected(e.target.files);
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded Images Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden group"
                        >
                          <Image
                            src={img.previewUrl}
                            alt="Product"
                            fill
                            unoptimized
                            className="object-cover"
                          />

                          {/* Upload Progress */}
                          {img.uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="text-center">
                                <Loader2 className="h-6 w-6 text-white animate-spin mx-auto mb-2" />
                                <p className="text-xs text-white">{img.uploadProgress}%</p>
                              </div>
                            </div>
                          )}

                          {/* Upload Error */}
                          {img.uploadStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRetryUpload(img.id)}
                                className="flex flex-col items-center gap-2 p-3 bg-black/60 rounded-lg"
                              >
                                <RefreshCw className="h-5 w-5 text-white" />
                                <span className="text-xs text-white">Retry</span>
                              </button>
                            </div>
                          )}

                          {/* Actions Overlay */}
                          {img.uploadStatus === 'done' && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(img.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  img.isMain
                                    ? "bg-white text-black"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {img.isMain ? "Main" : "Set Main"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Main Badge */}
                          {img.isMain && img.uploadStatus === 'done' && (
                            <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 rounded-md text-xs font-semibold">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pricing & Specifications - Similar structure to AddProductModal, truncated for brevity */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Pricing & Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Selling Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/70">
                      Selling Price <span className="text-red-400">*</span>
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
                    placeholder="e.g. 2499.00"
                    value={sellingPrice}
                    onChange={(e) => {
                      setSellingPrice(e.target.value);
                      if (errors.sellingPrice) setErrors((prev) => ({ ...prev, sellingPrice: "" }));
                    }}
                    className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                      errors.sellingPrice ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                    }`}
                  />
                </div>

                {/* MRP Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    MRP Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3499.00"
                    value={mrpPrice}
                    onChange={(e) => setMrpPrice(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Low Stock Threshold */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="5"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Vehicle Compatibility */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Vehicle Compatibility (comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Hyundai Creta 2020–2024, Kia Seltos 2019–2024"
                    value={vehicleCompatibility}
                    onChange={(e) => setVehicleCompatibility(e.target.value)}
                    className="w-full rounded-[20px] bg-[#0a0a0a] border border-white/10 p-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Product Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plug-and-Play Kit"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Color / Finish
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6500K Pure White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Dimensions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. H11 Socket / 74mm × 35mm base"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Material */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6063 Aviation Aluminum"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* Warranty */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-white/70">
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
          )}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-white/10 bg-[#0a0a0a] px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {errors.submit && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.submit}
            </span>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 2 && !isStep2Valid}
              className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-6 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
