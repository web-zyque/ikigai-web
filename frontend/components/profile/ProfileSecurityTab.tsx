"use client";

import React from "react";
import { Check, AlertCircle, KeyRound } from "lucide-react";
import { PasswordFormData } from "./profile.types";

interface ProfileSecurityTabProps {
  passwordState: PasswordFormData;
  setPasswordState: React.Dispatch<React.SetStateAction<PasswordFormData>>;
  passwordSuccess: boolean;
  passwordError: string;
  onPasswordSubmit: (e: React.FormEvent) => void;
}

export function ProfileSecurityTab({
  passwordState,
  setPasswordState,
  passwordSuccess,
  passwordError,
  onPasswordSubmit,
}: ProfileSecurityTabProps) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/10 p-6 sm:p-8">
      {passwordSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
          <Check className="h-4 w-4" />
          <span>Password changed successfully.</span>
        </div>
      )}

      {passwordError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{passwordError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={onPasswordSubmit} className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordState.current}
              onChange={(e) =>
                setPasswordState({ ...passwordState, current: e.target.value })
              }
              placeholder="••••••••"
              className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordState.newPass}
                onChange={(e) =>
                  setPasswordState({ ...passwordState, newPass: e.target.value })
                }
                placeholder="Min 6 characters"
                className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={passwordState.confirmPass}
                onChange={(e) =>
                  setPasswordState({
                    ...passwordState,
                    confirmPass: e.target.value,
                  })
                }
                placeholder="Confirm password"
                className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <KeyRound className="h-4 w-4 text-[#640C0C]" />
            <span>Password Guidelines</span>
          </div>
          <ul className="space-y-2 text-[11px] text-white/50 leading-relaxed list-disc list-inside">
            <li>Use a combination of uppercase, lowercase letters and numbers.</li>
            <li>Minimum 6 characters in length.</li>
            <li>Avoid using common phrases or personal information.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
