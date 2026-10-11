"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { User, Mail, Phone, Upload } from "lucide-react";
import { AdminProfileSettings } from "@/types/settings.types";

export interface AdminProfileSectionProps {
  data: AdminProfileSettings;
  onChange: (data: Partial<AdminProfileSettings>) => void;
  errors: Record<string, string>;
}

export default function AdminProfileSection({
  data,
  onChange,
  errors,
}: AdminProfileSectionProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({ avatarUrl: previewUrl });
    }
  };

  const initials = data.name
    ? data.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AU";

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] p-5 sm:p-6 shadow-sm space-y-4.5">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
            Admin Profile
          </h3>
          <p className="text-[11px] text-white/50">
            Account identity, notification email, and photo
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Compact Avatar Row */}
        <div>
          <label className="block text-[11px] font-medium text-white/70 mb-1.5">
            Profile Photo
          </label>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full border border-white/10 bg-[#640C0C] flex items-center justify-center overflow-hidden shrink-0 text-xs font-bold text-white shadow-md">
              {data.avatarUrl ? (
                <Image
                  src={data.avatarUrl}
                  alt="Admin Avatar"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white transition-colors cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                <span>Upload Photo</span>
              </button>
              <span className="text-[10px] text-white/40 hidden sm:inline">Square, max 2MB</span>
            </div>
          </div>
        </div>

        {/* Admin Name */}
        <div>
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Full Name <span className="text-[#640C0C]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Admin User"
              className={`w-full h-9 rounded-lg border ${
                errors.adminName ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
              } bg-[#0a0a0a] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
            />
          </div>
          {errors.adminName && (
            <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.adminName}</p>
          )}
        </div>

        {/* 2-Column: Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-white/80 mb-1">
              Email Address <span className="text-[#640C0C]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="admin@ikigai-auto.com"
                className={`w-full h-9 rounded-lg border ${
                  errors.adminEmail ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                } bg-[#0a0a0a] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
              />
            </div>
            {errors.adminEmail && (
              <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.adminEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/80 mb-1">
              Phone Number <span className="text-[#640C0C]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+91 98111 22334"
                className={`w-full h-9 rounded-lg border ${
                  errors.adminPhone ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                } bg-[#0a0a0a] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
              />
            </div>
            {errors.adminPhone && (
              <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.adminPhone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
