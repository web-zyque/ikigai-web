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
  Plus,
  ChevronDown,
  Info,
} from "lucide-react";
import { useCategories, useCreateProduct } from "@/hooks/use-products";
import { uploadApi } from "@/services/upload.service";
import { normalizeColorName, parseColorString, getColorInfo } from "@/lib/color-utils";

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
export type ActivePopup = "category" | "sizeType" | "sizePicker" | "colorPicker" | "vehiclePicker" | "warranty" | null;

const STANDARD_SIZES = [
  { label: "Small", code: "S" },
  { label: "Medium", code: "M" },
  { label: "Large", code: "L" },
  { label: "X Large", code: "XL" },
  { label: "XX Large", code: "XXL" },
];

const WARRANTY_OPTIONS = [
  "No Warranty",
  "6 Months Warranty",
  "1 Year Warranty",
  "2 Years Warranty",
  "3 Years Warranty",
  "5 Years Warranty",
  "Lifetime Warranty",
];

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

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const selectedCategory = availableCategories.find((cat) => cat.id === selectedCategoryId);
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  const [activePopup, setActivePopup] = useState<ActivePopup>(null);
  const togglePopup = (popup: ActivePopup) => {
    setActivePopup((prev) => (prev === popup ? null : popup));
  };

  const [hasColorVariants, setHasColorVariants] = useState(false);
  const [colorValues, setColorValues] = useState<string[]>(["Black", "White"]);
  const [newColorInput, setNewColorInput] = useState("");
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const [hasSizeVariants, setHasSizeVariants] = useState(false);
  const [sizeType, setSizeType] = useState<"standard" | "inch">("standard");
  const [customInchInput, setCustomInchInput] = useState("");
  const [sizeValues, setSizeValues] = useState<string[]>([]);
  const sizeTypeDropdownRef = useRef<HTMLDivElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);

  const [vehicleCompatibilityList, setVehicleCompatibilityList] = useState<string[]>(["All types of cars"]);
  const [newVehicleInput, setNewVehicleInput] = useState("");
  const vehiclePickerRef = useRef<HTMLDivElement>(null);

  const [material, setMaterial] = useState("");
  const [warranty, setWarranty] = useState("No Warranty");
  const warrantyDropdownRef = useRef<HTMLDivElement>(null);

  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingColor, setDraggingColor] = useState<string | null>(null);

  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState<number | string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | string>("5");
  const [acceptCod, setAcceptCod] = useState(false);
  const [acceptUpi, setAcceptUpi] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = (force = false) => {
    if (isSubmitting && !force) return;
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
    setActivePopup(null);
    setHasColorVariants(false);
    setColorValues(["Black", "White"]);
    setNewColorInput("");
    setHasSizeVariants(false);
    setSizeType("standard");
    setCustomInchInput("");
    setSizeValues([]);
    setVehicleCompatibilityList(["All types of cars"]);
    setNewVehicleInput("");
    setMaterial("");
    setWarranty("No Warranty");
    setUploadedImages([]);
    setSellingPrice("");
    setMrpPrice("");
    setStockQuantity("");
    setLowStockThreshold("5");
    setAcceptCod(false);
    setAcceptUpi(true);
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
    if (!trimmed) return;
    const normalized = normalizeColorName(trimmed);
    const isDuplicate = colorValues.some(c => normalizeColorName(c) === normalized);
    if (!isDuplicate) {
      setColorValues((prev) => [trimmed, ...prev]);
      setNewColorInput("");
      setActivePopup(null);
      if (errors.colorVariants) {
        setErrors((prev) => ({ ...prev, colorVariants: "" }));
      }
    } else {
      setErrors((prev) => ({ ...prev, colorVariants: `"${trimmed}" already added` }));
    }
  };

  const handleRemoveColorValue = (val: string) => {
    setColorValues((prev) => prev.filter((c) => c !== val));
    setUploadedImages((prev) => prev.filter((img) => img.variantColor !== val));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (categoryDropdownRef.current && categoryDropdownRef.current.contains(target)) ||
        (sizeTypeDropdownRef.current && sizeTypeDropdownRef.current.contains(target)) ||
        (sizePickerRef.current && sizePickerRef.current.contains(target)) ||
        (colorPickerRef.current && colorPickerRef.current.contains(target)) ||
        (vehiclePickerRef.current && vehiclePickerRef.current.contains(target)) ||
        (warrantyDropdownRef.current && warrantyDropdownRef.current.contains(target))
      ) {
        return;
      }
      setActivePopup(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOrAddSize = (val: string) => {
    if (sizeValues.includes(val)) {
      setSizeValues((prev) => prev.filter((s) => s !== val));
    } else {
      setSizeValues((prev) => [val, ...prev]);
      if (errors.sizeVariants) {
        setErrors((prev) => ({ ...prev, sizeVariants: "" }));
      }
    }
  };

  const handleAddCustomInch = () => {
    const trimmed = customInchInput.trim();
    if (!trimmed) return;
    const formatted = `${trimmed} Inch`;
    if (!sizeValues.includes(formatted)) {
      setSizeValues((prev) => [formatted, ...prev]);
    }
    setCustomInchInput("");
    setActivePopup(null);
    if (errors.sizeVariants) {
      setErrors((prev) => ({ ...prev, sizeVariants: "" }));
    }
  };

  const handleRemoveSizeValue = (val: string) => {
    setSizeValues((prev) => prev.filter((s) => s !== val));
  };

  const handleAddVehicle = () => {
    const trimmed = newVehicleInput.trim();
    if (!trimmed) return;
    setVehicleCompatibilityList((prev) => {
      const withoutDefault = prev.filter((v) => v !== "All types of cars");
      if (!withoutDefault.includes(trimmed)) {
        return [trimmed, ...withoutDefault];
      }
      return withoutDefault.length === 0 ? ["All types of cars"] : withoutDefault;
    });
    setNewVehicleInput("");
    setActivePopup(null);
    if (errors.vehicleCompatibility) {
      setErrors((prev) => ({ ...prev, vehicleCompatibility: "" }));
    }
  };

  const handleRemoveVehicle = (val: string) => {
    setVehicleCompatibilityList((prev) => {
      const remaining = prev.filter((v) => v !== val);
      return remaining.length === 0 ? ["All types of cars"] : remaining;
    });
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
      isMain: false, 
      variantColor,
      uploadStatus: 'pending' as UploadStatus,
      uploadProgress: 0,
    }));

    setUploadedImages((prev) => {
      const combined = [...prev, ...newItems];
      
      if (variantColor) {
        
        const colorImages = combined.filter(img => img.variantColor === variantColor);
        const hasMainForColor = colorImages.some(img => img.isMain);
        
        if (!hasMainForColor && colorImages.length > 0) {
          
          const firstColorImageIndex = combined.findIndex(img => img.variantColor === variantColor);
          if (firstColorImageIndex >= 0) {
            combined[firstColorImageIndex] = { ...combined[firstColorImageIndex], isMain: true };
          }
        }
      } else {
        
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
      
      
      if (removing?.isMain && filtered.length > 0) {
        const variantColor = removing.variantColor;
        
        if (variantColor) {
          
          const sameColorImages = filtered.filter(img => img.variantColor === variantColor);
          if (sameColorImages.length > 0) {
            const firstColorIndex = filtered.findIndex(img => img.variantColor === variantColor);
            if (firstColorIndex >= 0) {
              filtered[firstColorIndex] = { ...filtered[firstColorIndex], isMain: true };
            }
          }
        } else {
          
          const imagesWithoutVariant = filtered.filter(img => !img.variantColor);
          if (imagesWithoutVariant.length > 0) {
            const firstIndex = filtered.findIndex(img => !img.variantColor);
            if (firstIndex >= 0) {
              filtered[firstIndex] = { ...filtered[firstIndex], isMain: true };
            }
          }
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
      const targetImage = prev.find((img) => img.id === id);
      if (!targetImage) return prev;
      
      const variantColor = targetImage.variantColor;
      if (variantColor) {
        const matching = prev.filter((img) => img.variantColor === variantColor);
        const nonMatching = prev.filter((img) => img.variantColor !== variantColor);
        const target = matching.find((img) => img.id === id);
        if (!target) return prev;
        const targetUpdated = { ...target, isMain: true };
        const othersUpdated = matching
          .filter((img) => img.id !== id)
          .map((img) => ({ ...img, isMain: false }));
        return [...nonMatching, targetUpdated, ...othersUpdated];
      } else {
        const target = prev.find((img) => img.id === id);
        if (!target) return prev;
        const targetUpdated = { ...target, isMain: true };
        const othersUpdated = prev
          .filter((img) => img.id !== id)
          .map((img) => ({ ...img, isMain: false }));
        return [targetUpdated, ...othersUpdated];
      }
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    
    if (!productName.trim()) {
      newErrors.productName = "Product title is required";
    }
    
    if (!sku.trim()) {
      newErrors.sku = "SKU identifier is required";
    }
    
    if (!selectedCategoryId) {
      newErrors.categoryId = "Category selection is required";
    } else if (availableCategories.length > 0 && !availableCategories.find(cat => cat.id === selectedCategoryId)) {
      
      newErrors.categoryId = "Please select a valid category from the list";
    }
    
    if (!brand.trim()) {
      newErrors.brand = "Brand name is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (hasColorVariants && colorValues.length === 0) {
      newErrors.colorVariants = "Please add at least one color when color variants are enabled";
    }
    
    if (hasSizeVariants && sizeValues.length === 0) {
      newErrors.sizeVariants = "Please add at least one size when size variants are enabled";
    }

    if (vehicleCompatibilityList.length === 0) {
      newErrors.vehicleCompatibility = "Vehicle compatibility is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (hasColorVariants && colorValues.length > 0) {
      const imagesByColor: Record<string, typeof uploadedImages> = {};
      uploadedImages.forEach(img => {
        const color = img.variantColor || '';
        if (!imagesByColor[color]) imagesByColor[color] = [];
        imagesByColor[color].push(img);
      });
      
      const missingColors: string[] = [];
      const uploadingColors: string[] = [];
      const failedColors: string[] = [];
      
      colorValues.forEach(color => {
        const colorImages = imagesByColor[color] || [];
        const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
        const inFlightImages = colorImages.filter(img => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading');
        const failedImages = colorImages.filter(img => img.uploadStatus === 'error');
        
        if (doneImages.length < 3) {
          missingColors.push(`${color} (${doneImages.length}/3)`);
        }
        
        if (inFlightImages.length > 0) {
          uploadingColors.push(`${color} (${inFlightImages.length} uploading)`);
        }
        
        if (failedImages.length > 0) {
          failedColors.push(`${color} (${failedImages.length} failed)`);
        }
      });
      
      if (missingColors.length > 0) {
        newErrors.images = `Minimum 3 images required per color. Missing: ${missingColors.join(', ')}`;
      } else if (uploadingColors.length > 0) {
        newErrors.images = `Images still uploading: ${uploadingColors.join(', ')}. Please wait.`;
      } else if (failedColors.length > 0) {
        newErrors.images = `Upload failed for: ${failedColors.join(', ')}. Please retry or remove.`;
      }
    } else {
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

    if (!acceptCod && !acceptUpi) {
      newErrors.paymentMethods = "At least one payment method is required";
    }
    
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
    
    if (stockQuantity === "" || stockQuantity === undefined) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else {
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

  
  const isStep2Valid = useMemo(() => {
    if (hasColorVariants && colorValues.length > 0) {
      
      const imagesByColor: Record<string, typeof uploadedImages> = {};
      uploadedImages.forEach(img => {
        const color = img.variantColor || '';
        if (!imagesByColor[color]) imagesByColor[color] = [];
        imagesByColor[color].push(img);
      });
      
      
      for (const color of colorValues) {
        const colorImages = imagesByColor[color] || [];
        const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
        const inFlightImages = colorImages.filter(img => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading');
        const failedImages = colorImages.filter(img => img.uploadStatus === 'error');
        
        
        if (doneImages.length < 3) return false;
        
        
        if (inFlightImages.length > 0) return false;
        
        
        if (failedImages.length > 0) return false;
      }
      
      return true;
    } else {
      
      if (uploadedImages.length < 3) return false;
      
      const inFlight = uploadedImages.filter(
        (img) => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading',
      );
      if (inFlight.length > 0) return false;
      
      const failed = uploadedImages.filter((img) => img.uploadStatus === 'error');
      if (failed.length > 0) return false;
      
      return true;
    }
  }, [uploadedImages, hasColorVariants, colorValues]);

  const imageRequirementProgress = useMemo(() => {
    const groups = hasColorVariants && colorValues.length > 0
      ? colorValues.map((color) => uploadedImages.filter((image) => image.variantColor === color))
      : [uploadedImages];
    const minimumPerGroup = 3;
    const required = groups.length * minimumPerGroup;
    const completed = groups.reduce(
      (total, images) => total + Math.min(minimumPerGroup, images.filter((image) => image.uploadStatus === "done").length),
      0,
    );

    return {
      required,
      completed,
      percent: required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0,
    };
  }, [uploadedImages, hasColorVariants, colorValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const variantOrderCounters: Record<string, number> = {};
      const imagesPayload = uploadedImages.map((img) => {
        const colorKey = img.variantColor || "noVariant";
        if (variantOrderCounters[colorKey] === undefined) variantOrderCounters[colorKey] = 1;
        const displayOrder = img.isMain ? 0 : variantOrderCounters[colorKey]++;
        return {
          imageUrl: img.cloudinaryUrl ?? img.previewUrl,
          cloudinaryPublicId: img.publicId,
          isMainImage: img.isMain,
          displayOrder,
          altText: img.variantColor ? `${productName} (${img.variantColor})` : productName,
          variantColor: img.variantColor,
        };
      });

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
        acceptCod,
        acceptUpi,
        stockQuantity: stockQuantity === "" || stockQuantity === undefined ? 0 : Number(stockQuantity),
        lowStockThreshold: lowStockThreshold === "" || lowStockThreshold === undefined ? 5 : Number(lowStockThreshold),
        publicationStatus: "active" as const,
        vehicleCompatibility:
          vehicleCompatibilityList.length > 0 ? vehicleCompatibilityList : undefined,
        color: colorString,
        dimensions: sizeString || undefined,
        sizeType: hasSizeVariants ? sizeType : undefined,
        sizes: hasSizeVariants && sizeValues.length > 0 ? sizeValues : undefined,
        warranty: warranty.trim() || undefined,
        material: material.trim() || undefined,
        images: imagesPayload,
      };

      const result = await createProductMutation.mutateAsync(productPayload);
      onSuccess?.(result as unknown as Record<string, unknown>);
      handleClose(true);
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
      onClick={() => handleClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[92vh] max-h-[860px] flex flex-col rounded-[20px] border border-white/10 bg-[#0e0e0e] text-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-center border-b border-white/10 px-6 sm:px-8 py-3.5 bg-[#0a0a0a]">
          <div className="w-full max-w-md flex items-center justify-between">
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
                      className={`h-0.5 flex-1 mx-3 sm:mx-4 rounded transition-colors ${currentStep > step ? "bg-[#640C0C]" : "bg-white/10"
                        }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Basic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
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
                    <div className="relative" ref={categoryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => togglePopup("category")}
                        disabled={availableCategories.length === 0}
                        className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-left flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          errors.categoryId
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className={selectedCategory ? "text-white" : "text-white/30"}>
                          {selectedCategory ? selectedCategory.name : (availableCategories.length === 0 ? "No categories available" : "Select Category")}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${activePopup === "category" ? "rotate-180" : ""}`} />
                      </button>
                      {activePopup === "category" && (
                        <div className="absolute left-0 top-full mt-2 w-full z-50 rounded-2xl border border-white/15 bg-[#161616] p-1.5 shadow-2xl max-h-60 overflow-y-auto backdrop-blur-md">
                          {availableCategories.map((cat) => {
                            const isSelected = selectedCategoryId === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCategoryId(cat.id);
                                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
                                  setActivePopup(null);
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>{cat.name}</span>
                                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                
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
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border bg-[#0a0a0a] min-h-[70px] ${errors.colorVariants ? "border-red-500/30" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasColorVariants((prev) => !prev);
                          if (errors.colorVariants) setErrors((prev) => ({ ...prev, colorVariants: "" }));
                        }}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${hasColorVariants ? "bg-[#640C0C]" : "bg-white/20"}`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${hasColorVariants ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                      <span className="text-sm font-medium text-white">Color Variants</span>
                    </div>

                    {hasColorVariants && (
                      <div className="w-full sm:w-[460px] md:w-[480px] shrink-0">
                        <div className="w-full flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-[#121212] px-3 py-1.5 min-h-[42px] relative">
                          <div className="relative inline-flex items-center" ref={colorPickerRef}>
                            <button
                              type="button"
                              onClick={() => togglePopup("colorPicker")}
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                activePopup === "colorPicker" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                              title="Add color"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>

                            {activePopup === "colorPicker" && (
                              <div className="absolute left-0 bottom-full mb-2 w-72 z-50 rounded-2xl border border-white/15 bg-[#161616] p-3.5 shadow-2xl backdrop-blur-md">
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                    <span className="text-xs font-semibold text-white/90">Add Color</span>
                                    <span className="text-[10px] text-white/40">Color name</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="e.g. Matte Black"
                                      value={newColorInput}
                                      onChange={(e) => setNewColorInput(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddColorValue();
                                        }
                                      }}
                                      autoFocus
                                      className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleAddColorValue}
                                      className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {colorValues.map((color) => {
                            const colorInfo = getColorInfo(color);
                            return (
                              <span
                                key={color}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 pl-1 pr-2.5 py-1 text-xs text-white"
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                                  style={{ backgroundColor: colorInfo.hex }}
                                  title={`${color} (${colorInfo.hex})`}
                                />
                                {color}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorValue(color)}
                                  className="text-white/40 hover:text-white ml-0.5 cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-[20px] border bg-[#0a0a0a] min-h-[70px] ${errors.sizeVariants ? "border-red-500/30" : "border-white/10"}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setHasSizeVariants((prev) => !prev);
                          if (errors.sizeVariants) setErrors((prev) => ({ ...prev, sizeVariants: "" }));
                        }}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${hasSizeVariants ? "bg-[#640C0C]" : "bg-white/20"}`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-white transition-transform ${hasSizeVariants ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                      <span className="text-sm font-medium text-white">Size Variants</span>
                      {hasSizeVariants && (
                        <div className="relative inline-flex items-center" ref={sizeTypeDropdownRef}>
                          <button
                            type="button"
                            onClick={() => togglePopup("sizeType")}
                            className="flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer py-1"
                          >
                            <span>{sizeType === "standard" ? "Standard sizes" : "Inch sizes"}</span>
                            <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${activePopup === "sizeType" ? "rotate-180" : ""}`} />
                          </button>
                          {activePopup === "sizeType" && (
                            <div className="absolute left-0 bottom-full mb-2 w-36 z-50 rounded-xl border border-white/10 bg-[#161616] p-1 shadow-2xl">
                              <button
                                type="button"
                                onClick={() => {
                                  if (sizeType !== "standard") {
                                    setSizeType("standard");
                                    setSizeValues([]);
                                  }
                                  setActivePopup(null);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                  sizeType === "standard"
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>Standard sizes</span>
                                {sizeType === "standard" && <Check className="h-3.5 w-3.5 text-white" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (sizeType !== "inch") {
                                    setSizeType("inch");
                                    setSizeValues([]);
                                  }
                                  setActivePopup(null);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                  sizeType === "inch"
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span>Inch sizes</span>
                                {sizeType === "inch" && <Check className="h-3.5 w-3.5 text-white" />}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {hasSizeVariants && (
                      <div className="w-full sm:w-[460px] md:w-[480px] shrink-0">
                        <div className="w-full flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-[#121212] px-3 py-1.5 min-h-[42px] relative">
                          <div className="relative inline-flex items-center" ref={sizePickerRef}>
                            <button
                              type="button"
                              onClick={() => togglePopup("sizePicker")}
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                activePopup === "sizePicker" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
                              }`}
                              title={`Add ${sizeType === "standard" ? "Standard size" : "Inch size"}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>

                            {activePopup === "sizePicker" && (
                              <div className="absolute left-0 bottom-full mb-2 w-72 z-50 rounded-2xl border border-white/15 bg-[#161616] p-3.5 shadow-2xl backdrop-blur-md">
                                {sizeType === "standard" ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                      <span className="text-xs font-semibold text-white/90">Standard Sizes</span>
                                      <span className="text-[10px] text-white/40">Small to XX Large</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1">
                                      {STANDARD_SIZES.map((item) => {
                                        const isSelected = sizeValues.includes(item.label);
                                        return (
                                          <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleToggleOrAddSize(item.label)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                              isSelected
                                                ? "bg-[#640C0C] text-white font-medium"
                                                : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                {item.code}
                                              </span>
                                              <span>{item.label}</span>
                                            </div>
                                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                      <span className="text-xs font-semibold text-white/90">Inch Size</span>
                                      <span className="text-[10px] text-white/40">Enter numeric size</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        placeholder="e.g. 24"
                                        value={customInchInput}
                                        onChange={(e) => setCustomInchInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCustomInch();
                                          }
                                        }}
                                        autoFocus
                                        className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleAddCustomInch}
                                        className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {sizeValues.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => handleRemoveSizeValue(size)}
                                className="text-white/40 hover:text-white cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                      Specifications &amp; Vehicle Compatibility
                    </span>
                    {errors.vehicleCompatibility && (
                      <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> {errors.vehicleCompatibility}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/70 block">
                        Vehicle Compatibility <span className="text-red-400">*</span>
                      </label>
                      <div className="w-full flex flex-wrap items-center gap-1.5 rounded-[20px] border border-white/10 bg-[#0a0a0a] px-3.5 py-2 min-h-[46px] relative">
                        <div className="relative inline-flex items-center" ref={vehiclePickerRef}>
                          <button
                            type="button"
                            onClick={() => togglePopup("vehiclePicker")}
                            className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              activePopup === "vehiclePicker" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                            title="Add vehicle"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          {activePopup === "vehiclePicker" && (
                            <div className="absolute left-0 bottom-full mb-2 w-72 z-50 rounded-2xl border border-white/15 bg-[#161616] p-3.5 shadow-2xl backdrop-blur-md">
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                                  <span className="text-xs font-semibold text-white/90">Add Compatible Vehicle</span>
                                  <span className="text-[10px] text-white/40">Model / Type</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Mahindra Thar, Fortuner"
                                    value={newVehicleInput}
                                    onChange={(e) => setNewVehicleInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddVehicle();
                                      }
                                    }}
                                    autoFocus
                                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddVehicle}
                                    className="px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {vehicleCompatibilityList.map((vehicle) => (
                          <span
                            key={vehicle}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                          >
                            {vehicle}
                            <button
                              type="button"
                              onClick={() => handleRemoveVehicle(vehicle)}
                              className="text-white/40 hover:text-white cursor-pointer ml-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70 block">
                          Material
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Aviation Grade Die-Cast Aluminum"
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-white/70 block">
                          Warranty
                        </label>
                        <div className="relative" ref={warrantyDropdownRef}>
                          <button
                            type="button"
                            onClick={() => togglePopup("warranty")}
                            className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer"
                          >
                            <span>{warranty || "No Warranty"}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${activePopup === "warranty" ? "rotate-180" : ""}`} />
                          </button>
                          {activePopup === "warranty" && (
                            <div className="absolute left-0 bottom-full mb-2 w-full z-50 rounded-2xl border border-white/15 bg-[#161616] p-1.5 shadow-2xl">
                              {WARRANTY_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setWarranty(opt);
                                    setActivePopup(null);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                    warranty === opt
                                      ? "bg-white/10 text-white font-medium"
                                      : "text-white/70 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {warranty === opt && <Check className="h-3.5 w-3.5 text-white" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          
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
                </div>
              </div>

              {hasColorVariants && colorValues.length > 0 ? (
                <div className="space-y-6">
                  {colorValues.map((colorName) => {
                    const colorImages = uploadedImages.filter(
                      (img) => img.variantColor === colorName
                    );
                    const isDragOverThis = draggingColor === colorName;
                    
                    const doneImages = colorImages.filter(img => img.uploadStatus === 'done');
                    const uploadingImages = colorImages.filter(img => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading');
                    const failedImages = colorImages.filter(img => img.uploadStatus === 'error');
                    const minRequired = 3;
                    const isColorComplete = doneImages.length >= minRequired;
                    const colorInfo = getColorInfo(colorName);

                    return (
                      <div key={colorName} className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: colorInfo.hex }}
                            />
                            <span className="text-sm font-semibold text-white capitalize">{colorName}</span>
                            <span className={`text-xs font-medium ml-1 ${
                              isColorComplete 
                                ? 'text-green-400' 
                                : doneImages.length > 0 
                                  ? 'text-yellow-400' 
                                  : 'text-white/40'
                            }`}>
                              ({doneImages.length}/{minRequired} uploaded)
                            </span>
                            {uploadingImages.length > 0 && (
                              <span className="text-xs text-blue-400 flex items-center gap-1 ml-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {uploadingImages.length} uploading
                              </span>
                            )}
                            {failedImages.length > 0 && (
                              <span className="text-xs text-red-400 flex items-center gap-1 ml-1">
                                <AlertCircle className="h-3 w-3" />
                                {failedImages.length} failed
                              </span>
                            )}
                          </div>
                          {isColorComplete && (
                            <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
                              <Check className="h-3.5 w-3.5" />
                              Complete
                            </span>
                          )}
                        </div>

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
                          className={`w-full rounded-[20px] border transition-all p-4 ${
                            isDragOverThis
                              ? "border-white bg-white/10"
                              : colorImages.length > 0
                                ? "border-white/10 bg-[#0a0a0a]"
                                : "border-dashed border-white/15 bg-[#0a0a0a] hover:border-white/30"
                          }`}
                        >
                          {colorImages.length > 0 ? (
                            <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 min-h-[160px]">
                              <label className="relative aspect-square rounded-xl border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-all cursor-pointer group">
                                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-1 group-hover:bg-white/10">
                                  <Plus className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-[11px] font-medium text-white/60 group-hover:text-white transition-colors">Add Image</span>
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

                              {[...colorImages].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0)).map((img) => (
                                <div
                                  key={img.id}
                                  className={`group relative aspect-square rounded-xl border bg-black/40 overflow-hidden p-1 flex flex-col justify-between ${
                                    img.isMain
                                      ? "border-white ring-1 ring-white"
                                      : "border-white/10 hover:border-white/30"
                                  }`}
                                >
                                  <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                                    <Image
                                      src={img.previewUrl}
                                      alt={colorName}
                                      fill
                                      unoptimized
                                      className={`object-contain p-1 transition-all duration-200 ${
                                        !img.isMain ? "group-hover:opacity-30 group-hover:scale-95" : ""
                                      }`}
                                      sizes="140px"
                                    />
                                    {!img.isMain && (
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />
                                    )}
                                    {img.isMain && (
                                      <span className="absolute top-1.5 left-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-semibold text-white z-10">
                                        Main
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(img.id)}
                                      className="absolute top-1.5 right-1.5 z-20 grid h-5 w-5 place-items-center rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                    {!img.isMain && img.uploadStatus === "done" && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetMainImage(img.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-white text-black hover:bg-white/90 px-3 py-1 text-[10px] font-semibold shadow-2xl cursor-pointer whitespace-nowrap scale-95 group-hover:scale-100"
                                      >
                                        Set as main
                                      </button>
                                    )}
                                    {(img.uploadStatus === 'uploading' || img.uploadStatus === 'pending') && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-lg">
                                        <Loader2 className="h-5 w-5 animate-spin text-white mb-1" />
                                        <span className="text-[10px] text-white/80">{img.uploadProgress}%</span>
                                      </div>
                                    )}
                                    {img.uploadStatus === 'error' && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/85 rounded-lg p-1.5 text-center">
                                        <AlertCircle className="h-4 w-4 text-red-400 mb-0.5" />
                                        <span className="text-[9px] text-red-300 line-clamp-1">{img.uploadError ?? 'Failed'}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRetryUpload(img.id)}
                                          className="mt-1 px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-500 text-[9px] text-white cursor-pointer"
                                        >
                                          Retry
                                        </button>
                                      </div>
                                    )}
                                    {img.uploadStatus === 'done' && (
                                      <div className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                        <Check className="h-2.5 w-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center min-h-[160px] py-6 text-center">
                              <div className="mb-2 flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                              <span className="text-xs text-white/50 mb-1 font-medium">
                                No images uploaded for {colorName} yet
                              </span>
                              <span className="text-[11px] text-white/30 mb-3">
                                Minimum {minRequired} images required
                              </span>
                              <label className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm">
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
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedImages.length > 0 ? (
                    <div className="w-full rounded-[20px] border border-white/10 bg-[#0a0a0a] p-4">
                      <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        <label className="relative aspect-square rounded-xl border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-all cursor-pointer group">
                          <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-1 group-hover:bg-white/10">
                            <Plus className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-[11px] font-medium text-white/60 group-hover:text-white transition-colors">Add Image</span>
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
                        </label>

                        {[...uploadedImages].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0)).map((img, idx) => (
                          <div
                            key={img.id}
                            className={`group relative aspect-square rounded-xl border bg-black/40 overflow-hidden p-1 flex flex-col justify-between ${
                              img.isMain
                                ? "border-white ring-1 ring-white"
                                : "border-white/10 hover:border-white/30"
                            }`}
                          >
                            <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center">
                              <Image
                                src={img.previewUrl}
                                alt={`Preview ${idx + 1}`}
                                fill
                                unoptimized
                                className={`object-contain p-1 transition-all duration-200 ${
                                  !img.isMain ? "group-hover:opacity-30 group-hover:scale-95" : ""
                                }`}
                                sizes="140px"
                              />
                              {!img.isMain && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />
                              )}
                              {img.isMain && (
                                <span className="absolute top-1.5 left-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[9px] font-semibold text-white z-10">
                                  Main
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="absolute top-1.5 right-1.5 z-20 grid h-5 w-5 place-items-center rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {!img.isMain && img.uploadStatus === "done" && (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(img.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full bg-white text-black hover:bg-white/90 px-3 py-1 text-[10px] font-semibold shadow-2xl cursor-pointer whitespace-nowrap scale-95 group-hover:scale-100"
                                >
                                  Set as main
                                </button>
                              )}
                              {(img.uploadStatus === 'uploading' || img.uploadStatus === 'pending') && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-lg">
                                  <Loader2 className="h-5 w-5 animate-spin text-white mb-1" />
                                  <span className="text-[10px] text-white/80">{img.uploadProgress}%</span>
                                </div>
                              )}
                              {img.uploadStatus === 'error' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/85 rounded-lg p-1.5 text-center">
                                  <AlertCircle className="h-4 w-4 text-red-400 mb-0.5" />
                                  <span className="text-[9px] text-red-300 line-clamp-1">{img.uploadError ?? 'Failed'}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRetryUpload(img.id)}
                                    className="mt-1 px-2 py-0.5 rounded-full bg-red-600 hover:bg-red-500 text-[9px] text-white cursor-pointer"
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}
                              {img.uploadStatus === 'done' && (
                                <div className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
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
                      className={`relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-dashed p-6 transition-all text-center cursor-pointer ${
                        isDragging
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
                      <div className="mb-2 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <p className="mb-1 text-sm font-semibold text-white">
                        Drop product images here
                      </p>
                      <p className="text-xs text-white/40 max-w-sm mb-4">
                        PNG, JPG, WEBP up to 10MB each. Select multiple files.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mainFileInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Select Images</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
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
                      placeholder="e.g. 50"
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
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="5 (defaults to 5 if empty)"
                        value={lowStockThreshold}
                        onChange={(e) => {
                          setLowStockThreshold(e.target.value);
                          if (errors.lowStockThreshold) setErrors((prev) => ({ ...prev, lowStockThreshold: "" }));
                        }}
                        className={`w-full h-12 rounded-full bg-[#0a0a0a] border pl-4 pr-10 text-sm text-white placeholder-white/30 outline-none transition-colors ${errors.lowStockThreshold ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-white/30"
                          }`}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 group cursor-pointer">
                        <Info className="h-3.5 w-3.5 text-white/30 group-hover:text-white transition-colors" />
                        <div className="pointer-events-none absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-[#161616] border border-white/15 p-2.5 text-xs text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          Triggers low stock warnings when inventory drops below this quantity
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                    Accepted Payment Types
                  </h3>
                  {errors.paymentMethods && (
                    <p role="alert" className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.paymentMethods}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {([
                    { id: "cod", title: "Cash on Delivery (COD)", enabled: acceptCod, onChange: setAcceptCod },
                    { id: "upi", title: "UPI", enabled: acceptUpi, onChange: setAcceptUpi },
                  ] as const).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
                      <p className="text-sm font-medium text-white">{payment.title}</p>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={payment.enabled}
                        aria-label={`${payment.title} accepted`}
                        onClick={() => {
                          if (payment.enabled) {
                            const otherEnabled = payment.id === "cod" ? acceptUpi : acceptCod;
                            if (!otherEnabled) {
                              setErrors((prev) => ({ ...prev, paymentMethods: "At least one payment method is required" }));
                              return;
                            }
                          }
                          payment.onChange((value) => !value);
                          if (errors.paymentMethods) {
                            setErrors((previous) => {
                              const copy = { ...previous };
                              delete copy.paymentMethods;
                              return copy;
                            });
                          }
                        }}
                        className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${payment.enabled ? "bg-[#640C0C]" : "bg-white/20"}`}
                      >
                        <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${payment.enabled ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-[#0a0a0a] px-8 py-4">
          <button
            type="button"
            onClick={() => handleClose()}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>

          <div className="flex flex-col items-end gap-1">
            {errors.submit && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.submit}
              </span>
            )}
            <div className="flex items-center gap-2.5">
              {currentStep > 1 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
              {currentStep < totalSteps ? (
                (() => {
                  const uploadsInFlight = currentStep === 2
                    ? uploadedImages.some((img) => img.uploadStatus === 'pending' || img.uploadStatus === 'uploading')
                    : false;
                  const isDisabled = currentStep === 2 ? !isStep2Valid : uploadsInFlight;
                  
                  const hoverTitle = isDisabled && currentStep === 2
                    ? uploadsInFlight
                      ? "Please wait for images to finish uploading"
                      : "Upload minimum images to continue"
                    : undefined;

                  return (
                    <div className="relative group inline-block">
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isDisabled}
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
                      {isDisabled && currentStep === 2 && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-xl bg-[#161616] border border-white/15 px-3 py-1.5 text-xs text-white shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                          {uploadsInFlight ? "Please wait for images to finish uploading" : "Upload minimum images to continue"}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Product...</span>
                    </>
                  ) : (
                    <span>Publish Product</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

