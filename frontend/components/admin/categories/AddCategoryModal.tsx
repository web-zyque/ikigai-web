"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useCreateCategory } from "@/hooks/use-products";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createCategoryMutation = useCreateCategory();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createCategoryMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, createCategoryMutation.isPending, onClose]);

  const slugPreview = name.trim()
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }

    setErrorMessage(null);

    try {
      await createCategoryMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName("");
      setDescription("");
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

  const handleModalClose = () => {
    if (createCategoryMutation.isPending) return;
    setName("");
    setDescription("");
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        onClick={handleModalClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 w-full max-w-lg rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 id="modal-title" className="text-lg font-bold tracking-tight text-white">
              Add Category
            </h2>
            <p className="mt-0.5 text-xs text-white/50">
              Create a new product category for your store catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            disabled={createCategoryMutation.isPending}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="category-name" className="text-xs font-medium text-white/80 block">
              Category Name <span className="text-[#640C0C]">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g., Performance Brakes"
              className="w-full h-10 rounded-lg bg-[#0a0a0a] border border-white/10 px-3.5 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-white/30 focus:bg-[#161616]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 block">
              URL Slug <span className="text-white/30">(Auto-generated)</span>
            </label>
            <div className="h-9 w-full rounded-lg bg-[#0a0a0a] border border-white/5 px-3.5 flex items-center text-xs font-mono text-white/50">
              {slugPreview ? (
                <span className="text-white/80">{slugPreview}</span>
              ) : (
                <span className="text-white/30 italic">Generated based on category name</span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="category-desc" className="text-xs font-medium text-white/80 block">
              Description <span className="text-white/40 text-[11px]">(Optional)</span>
            </label>
            <textarea
              id="category-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the category and items it contains..."
              className="w-full rounded-lg bg-[#0a0a0a] border border-white/10 p-3 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-white/30 focus:bg-[#161616] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={createCategoryMutation.isPending}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-xs font-semibold text-white transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
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
