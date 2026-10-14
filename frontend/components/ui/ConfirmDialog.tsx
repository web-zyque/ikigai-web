"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, Trash2, Archive, Check } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isLoading) onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="h-5 w-5 text-red-500" />,
          iconBg: "bg-red-500/10 border-red-500/20",
          button: "bg-[#640C0C] hover:bg-[#7a1010] text-white",
        };
      case "warning":
        return {
          icon: <Archive className="h-5 w-5 text-amber-400" />,
          iconBg: "bg-amber-500/10 border-amber-500/20",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-400" />,
          iconBg: "bg-blue-500/10 border-blue-500/20",
          button: "bg-white text-black hover:bg-white/90",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${styles.iconBg}`}
          >
            {styles.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight text-white">{title}</h3>
            <p className="text-xs text-white/60 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onConfirm();
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${styles.button}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
