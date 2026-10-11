"use client";

import React from "react";
import { Bell, ShoppingCart, AlertTriangle, XCircle } from "lucide-react";
import { NotificationSettings } from "@/types/settings.types";

export interface NotificationSettingsSectionProps {
  data: NotificationSettings;
  onChange: (data: Partial<NotificationSettings>) => void;
}

export default function NotificationSettingsSection({
  data,
  onChange,
}: NotificationSettingsSectionProps) {
  const notificationOptions = [
    {
      key: "newOrders" as const,
      label: "New Order Alerts",
      description: "Instant notification when customer orders are placed",
      icon: ShoppingCart,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      enabled: data.newOrders,
    },
    {
      key: "lowStockAlerts" as const,
      label: "Low-Stock Alerts",
      description: "Alerts when catalog stock drops under safety threshold",
      icon: AlertTriangle,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      enabled: data.lowStockAlerts,
    },
    {
      key: "cancelledOrders" as const,
      label: "Cancelled Order Alerts",
      description: "Real-time notice when an order is cancelled",
      icon: XCircle,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      enabled: data.cancelledOrders,
    },
  ];

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] p-5 sm:p-6 shadow-sm space-y-4.5">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-3.5">
        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
          <Bell className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
            Notification Preferences
          </h3>
          <p className="text-[11px] text-white/50">
            System alerts and real-time operational notifications
          </p>
        </div>
      </div>

      {/* 3-Column Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {notificationOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.key}
              className="p-3.5 rounded-xl bg-[#0a0a0a] border border-white/5 flex flex-col justify-between gap-3 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${opt.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={opt.enabled}
                  onClick={() => onChange({ [opt.key]: !opt.enabled })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    opt.enabled ? "bg-[#640C0C]" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      opt.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-white text-xs">{opt.label}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-medium border ${
                      opt.enabled
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-white/5 text-white/40"
                    }`}
                  >
                    {opt.enabled ? "On" : "Off"}
                  </span>
                </div>
                <p className="text-white/40 text-[10px] leading-snug">{opt.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
