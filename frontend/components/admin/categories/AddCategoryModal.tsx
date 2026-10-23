"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, AlertCircle, Loader2, Upload, Trash2, RefreshCw, Check } from "lucide-react";
import { useCreateCategory } from "@/hooks/use-products";
import { uploadApi } from "@/services/upload.service";

export interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCategoryMutation = useCreateCategory();

  const handleClose = () => {
    if (createCategoryMutation.isPending || uploadStatus === "uploading") return;
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setName("");
    setDescription("");
    setImageUrl("");
    setImageFile(null);
    setPreviewUrl("");
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError(null);
    setErrorMessage(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !createCategoryMutation.isPending && uploadStatus !== "uploading") {
          handleClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, createCategoryMutation.isPending, uploadStatus]);

  if (!isOpen) return null;

  const slugPreview = name.trim()
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

  const handleFileSelected = async (file: File) => {
    const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    if (!ALLOWED.has(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB.");
      return;
    }

    setUploadError(null);
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const result = await uploadApi.uploadImage(file, (percent) => {
        setUploadProgress(percent);
      });
      setImageUrl(result.imageUrl);
      setUploadStatus("done");
      setUploadProgress(100);
    } catch (err: unknown) {
      setUploadStatus("error");
      setUploadError(err instanceof Error ? err.message : "Image upload failed.");
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl("");
    setImageUrl("");
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }

    if (uploadStatus === "uploading") {
      setErrorMessage("Please wait for the image upload to complete.");
      return;
    }

    setErrorMessage(null);

    try {
      await createCategoryMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setName("");
      setDescription("");
      setImageUrl("");
      setImageFile(null);
      setPreviewUrl("");
      setUploadStatus("idle");
      setErrorMessage(null);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create category. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl flex flex-col rounded-[20px] border border-white/10 bg-[#0e0e0e] text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5 bg-[#0a0a0a] shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Add New Category</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Fill in category details, image, and catalog organization
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={createCategoryMutation.isPending || uploadStatus === "uploading"}
            aria-label="Close modal"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-8 space-y-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="border-b border-white/10 pb-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Category Information
              </h3>
            </div>

            <div className="space-y-5">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label htmlFor="category-name-input" className="text-xs font-medium text-white/70 block">
                  Category Name <span className="text-[#640C0C]">*</span>
                </label>
                <input
                  id="category-name-input"
                  type="text"
                  required
                  placeholder="e.g. Performance Lighting, Interior Styling, Off-Road Accessories"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {/* URL Slug (Auto-generated preview) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 block">
                  URL Slug <span className="text-white/40 font-normal">(Auto-generated identifier)</span>
                </label>
                <div className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/5 px-4 flex items-center text-sm font-mono text-white/70 select-all">
                  {slugPreview ? (
                    <span className="text-white/90">{slugPreview}</span>
                  ) : (
                    <span className="text-white/30 italic">Generated based on category name</span>
                  )}
                </div>
              </div>

              {/* Category Image Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70 block">
                    Category Image <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  {uploadStatus === "done" && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="h-3 w-3" /> Image ready
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                />

                {previewUrl || imageUrl ? (
                  <div className="relative group w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                    <Image
                      src={previewUrl || imageUrl}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />

                    {uploadStatus === "uploading" && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                        <span className="text-xs font-medium text-white">
                          Uploading image... {uploadProgress}%
                        </span>
                        <div className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#640C0C] transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 p-4 text-center">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-xs text-red-300">{uploadError || "Upload failed"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {imageFile && (
                            <button
                              type="button"
                              onClick={() => handleFileSelected(imageFile)}
                              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                            >
                              <RefreshCw className="h-3 w-3" /> Retry
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadStatus !== "uploading" && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 shadow-md transition-colors cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Change Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer"
                          aria-label="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
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
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors cursor-pointer ${
                      isDragging
                        ? "border-[#640C0C] bg-[#640C0C]/10"
                        : "border-white/15 bg-[#0a0a0a] hover:border-white/30 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 border border-white/10 text-white/50 mb-2">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-white/80 mb-0.5">
                      Drop category image here, or <span className="text-white underline">browse</span>
                    </p>
                    <p className="text-[11px] text-white/40">
                      JPEG, PNG, WebP up to 10MB
                    </p>
                    {uploadError && (
                      <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {uploadError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="category-desc-input" className="text-xs font-medium text-white/70 block">
                  Description <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="category-desc-input"
                  rows={3}
                  placeholder="Provide a clear description of the products and accessories included under this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl bg-[#0a0a0a] border border-white/10 p-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Bottom Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/10 bg-[#0a0a0a] px-8 py-4 shrink-0">
            <button
              type="button"
              disabled={createCategoryMutation.isPending || uploadStatus === "uploading"}
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createCategoryMutation.isPending || uploadStatus === "uploading" || !name.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-7 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Category...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
