"use client";

import React from "react";
import { Truck } from "lucide-react";
import { ShippingSettings } from "@/types/settings.types";

export interface ShippingSettingsSectionProps {
  data: ShippingSettings;
  onChange: (data: Partial<ShippingSettings>) => void;
  errors: Record<string, string>;
}

export default function ShippingSettingsSection({
  data,
  onChange,
  errors,
}: ShippingSettingsSectionProps) {
  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] p-5 sm:p-6 shadow-sm space-y-4.5">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
          <Truck className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
            Shipping Settings
          </h3>
          <p className="text-[11px] text-white/50">
            Standard delivery rate and free shipping eligibility
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Flat Shipping Charge */}
        <div>
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Standard Delivery Fee (₹) <span className="text-[#640C0C]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              min={0}
              step={10}
              value={data.shippingCharge}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  onChange({ shippingCharge: "" as unknown as number });
                  return;
                }

                const parsed = Number(value);

                if (Number.isFinite(parsed) && parsed >= 0) {
                  onChange({ shippingCharge: parsed });
                }
              }}
              placeholder="150"
              className={`w-full h-9 rounded-lg border ${errors.shippingCharge ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                } bg-[#0a0a0a] pl-7 pr-3 text-xs font-mono text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            Base shipping rate charged on orders.
          </p>
          {errors.shippingCharge && (
            <p className="text-[#640C0C] text-[10px] mt-1 font-medium">{errors.shippingCharge}</p>
          )}
        </div>

        {/* Free Shipping Minimum Threshold */}
        <div>
          <label className="block text-[11px] font-medium text-white/80 mb-1">
            Free Shipping Minimum (₹) <span className="text-[#640C0C]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={data.freeShippingThreshold}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  onChange({ freeShippingThreshold: "" as unknown as number });
                  return;
                }

                const parsed = Number(value);

                if (Number.isFinite(parsed) && parsed >= 0) {
                  onChange({ freeShippingThreshold: parsed });
                }
              }}
              placeholder="2500"
              className={`w-full h-9 rounded-lg border ${errors.freeShippingThreshold
                ? "border-[#640C0C] ring-1 ring-[#640C0C]"
                : "border-white/10"
                } bg-[#0a0a0a] pl-7 pr-3 text-xs font-mono text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            Orders above this subtotal ship free.
          </p>
          {errors.freeShippingThreshold && (
            <p className="text-[#640C0C] text-[10px] mt-1 font-medium">
              {errors.freeShippingThreshold}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
