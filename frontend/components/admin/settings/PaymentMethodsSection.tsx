"use client";

import React from "react";
import { CreditCard, QrCode, Banknote } from "lucide-react";
import { PaymentMethodsSettings } from "@/types/settings.types";

export interface PaymentMethodsSectionProps {
  data: PaymentMethodsSettings;
  onChange: (data: Partial<PaymentMethodsSettings>) => void;
}

export default function PaymentMethodsSection({
  data,
  onChange,
}: PaymentMethodsSectionProps) {
  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] p-5 sm:p-6 shadow-sm space-y-4.5">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
          <CreditCard className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
            Payment Methods
          </h3>
          <p className="text-[11px] text-white/50">
            Payment options enabled at storefront checkout
          </p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* UPI / QR Code Option */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <QrCode className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs truncate">UPI / QR Code</span>
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-medium border ${
                    data.upiEnabled
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  {data.upiEnabled ? "Active" : "Off"}
                </span>
              </div>
              <p className="text-white/40 text-[10px] truncate">
                GPay, PhonePe, Paytm, BHIM QR
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={data.upiEnabled}
            onClick={() => onChange({ upiEnabled: !data.upiEnabled })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              data.upiEnabled ? "bg-[#640C0C]" : "bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.upiEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Cash on Delivery (COD) Option */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Banknote className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-xs truncate">Cash on Delivery</span>
                <span
                  className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-medium border ${
                    data.codEnabled
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  {data.codEnabled ? "Active" : "Off"}
                </span>
              </div>
              <p className="text-white/40 text-[10px] truncate">
                Cash payment at package delivery
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={data.codEnabled}
            onClick={() => onChange({ codEnabled: !data.codEnabled })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              data.codEnabled ? "bg-[#640C0C]" : "bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.codEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
