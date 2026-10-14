"use client";

import { Check, LoaderCircle } from "lucide-react";

interface SettingsActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  hasChanges: boolean;
}

export default function SettingsActionButtons({
  onSave,
  onCancel,
  isSaving = false,
  hasChanges,
}: SettingsActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-3 py-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving || !hasChanges}
        className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-transparent px-6 text-sm font-semibold text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#640C0C] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#7a1010] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSaving ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}

        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
      </button>
    </div>
  );
}