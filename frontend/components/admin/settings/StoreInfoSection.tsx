"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Store, Phone, Mail, MapPin, Upload } from "lucide-react";
import { StoreInfoSettings } from "@/types/settings.types";

export interface StoreInfoSectionProps {
  data: StoreInfoSettings;
  onChange: (data: Partial<StoreInfoSettings>) => void;
  errors: Record<string, string>;
}

export default function StoreInfoSection({
  data,
  onChange,
  errors,
}: StoreInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({ logoUrl: previewUrl });
    }
  };

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] p-5 sm:p-6 shadow-sm space-y-4.5">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
        <div className="h-8 w-8 rounded-lg bg-[#640C0C]/20 border border-[#640C0C]/30 flex items-center justify-center text-white shrink-0">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
            Store Information
          </h3>
          <p className="text-[11px] text-white/50">
            Brand identity, contact numbers, and store location
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Compact Logo Row */}
        <div>
          <label className="block text-[11px] font-medium text-white/70 mb-1.5">
            Store Logo
          </label>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-xl border border-white/10 bg-[#0a0a0a] flex items-center justify-center overflow-hidden shrink-0">
              {data.logoUrl ? (
                <Image
                  src={data.logoUrl}
                  alt="Store Logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Store className="h-5 w-5 text-white/40" />
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white transition-colors cursor-pointer"
              >
                <Upload className="h-3 w-3" />
                <span>Change Logo</span>
              </button>
              <span className="text-[10px] text-white/40 hidden sm:inline">PNG, JPG, SVG</span>
            </div>
          </div>
        </div>

        {/* Store Name */}
        <div>
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Store Name <span className="text-[#640C0C]">*</span>
          </label>
          <input
            type="text"
            value={data.storeName}
            onChange={(e) => onChange({ storeName: e.target.value })}
            placeholder="e.g. IKIGAI Auto Parts"
            className={`w-full h-9 rounded-lg border ${
              errors.storeName ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
            } bg-[#0a0a0a] px-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
          />
          {errors.storeName && (
            <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.storeName}</p>
          )}
        </div>

        {/* 2-Column: Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-white/80 mb-1">
              Support Phone <span className="text-[#640C0C]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+91 98200 12345"
                className={`w-full h-9 rounded-lg border ${
                  errors.phone ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                } bg-[#0a0a0a] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
              />
            </div>
            {errors.phone && (
              <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/80 mb-1">
              Official Email <span className="text-[#640C0C]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
              <input
                type="email"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
                placeholder="support@ikigai-auto.com"
                className={`w-full h-9 rounded-lg border ${
                  errors.email ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                } bg-[#0a0a0a] pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
              />
            </div>
            {errors.email && (
              <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Store Address <span className="text-[#640C0C]">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <textarea
              rows={2}
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Building, Street, Landmark, City, State, PIN"
              className={`w-full rounded-lg border ${
                errors.address ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
              } bg-[#0a0a0a] pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors resize-none`}
            />
          </div>
          {errors.address && (
            <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.address}</p>
          )}
        </div>
      </div>
    </div>
  );
}
