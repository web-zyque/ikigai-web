"use client";

import React from "react";
import { Check, CheckCircle2, ShieldCheck, Pencil } from "lucide-react";
import { ProfileFormData } from "./profile.types";
import { User } from "@/types/auth.types";

interface ProfileInfoTabProps {
  user: User | null | undefined;
  initials: string;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isEditingInfo: boolean;
  setIsEditingInfo: React.Dispatch<React.SetStateAction<boolean>>;
  savedSuccess: boolean;
  onSaveProfile: (e: React.FormEvent) => void;
}

export function ProfileInfoTab({
  user,
  initials,
  formData,
  setFormData,
  isEditingInfo,
  setIsEditingInfo,
  savedSuccess,
  onSaveProfile,
}: ProfileInfoTabProps) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/10 overflow-hidden">
      {savedSuccess && (
        <div className="m-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
          <Check className="h-4 w-4" />
          <span>Profile information updated successfully!</span>
        </div>
      )}

      <div className="p-4 sm:p-7 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-white/[0.03] to-transparent">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="flex h-13 w-13 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#640C0C]/80 via-[#202020] to-black border border-white/20 text-base sm:text-xl font-bold text-white shadow-xl">
              {initials}
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#121212] border border-emerald-500/30 text-emerald-400"
              title="Verified Account"
            >
              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-emerald-500/20 text-emerald-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                {formData.name || "Customer Account"}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 shrink-0">
                <ShieldCheck className="h-3 w-3" />
                <span className="hidden sm:inline">Verified</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/40 font-mono mt-0.5 truncate">
              Member ID: #{user?.id ? user.id.slice(0, 8).toUpperCase() : "IK-001"}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {!isEditingInfo ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditingInfo(true)}
                className="sm:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all cursor-pointer shadow-sm hover:border-white/30"
                aria-label="Edit Profile"
              >
                <Pencil className="h-4 w-4 text-[#640C0C]" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingInfo(true)}
                className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/15 transition-all cursor-pointer shadow-sm hover:border-white/30"
              >
                <Pencil className="h-3.5 w-3.5 text-[#640C0C]" />
                <span>Edit Information</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingInfo(false)}
              className="text-xs text-white/50 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSaveProfile} className="p-6 sm:p-7 space-y-6">
        {isEditingInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white placeholder:text-white/30 focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Gender
              </label>
              <div className="flex items-center gap-6 py-1">
                {(["male", "female", "other"] as const).map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 text-xs text-white/80 capitalize cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === g}
                      onChange={() =>
                        setFormData({ ...formData, gender: g })
                      }
                      className="accent-[#640C0C] h-4 w-4 cursor-pointer"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs font-mono text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="px-4 py-2 rounded-full border border-white/15 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                Full Name
              </span>
              <p className="text-sm font-semibold text-white">
                {formData.name || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                Date of Birth
              </span>
              <p className="text-sm font-semibold text-white font-mono">
                {formData.dob || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                Gender
              </span>
              <p className="text-sm font-semibold text-white capitalize">
                {formData.gender || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                Phone Number
              </span>
              <p className="text-sm font-semibold text-white font-mono">
                {formData.phone || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                Email Address
              </span>
              <p className="text-sm font-semibold text-white">
                {formData.email || "—"}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
