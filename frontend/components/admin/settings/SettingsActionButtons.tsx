"use client";

import React from "react";
import { Check, RotateCcw } from "lucide-react";

export interface SettingsActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export default function SettingsActionButtons({
  onSave,
  onCancel,
  onReset,
  isSaving = false,
}: SettingsActionButtonsProps) {
  return (
    <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0a0a0a]/95 border border-white/10 backdrop-blur-md shadow-2xl">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
      >
        <RotateCcw className="h-3.5 w-3.5 text-white/40" />
        <span>Reset to Defaults</span>
      </button>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-md shadow-[#640C0C]/30 cursor-pointer disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}
