"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function LogoutDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: LogoutDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-5"
      >
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#640C0C]/10 border border-[#640C0C]/20 text-[#640C0C]">
            <LogOut className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight text-white">
              Sign Out of Your Account
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Are you sure you want to sign out? You will need to log in again with your phone number and password.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-5 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
