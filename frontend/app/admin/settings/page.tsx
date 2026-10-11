"use client";

import React, { useState } from "react";
import { Menu, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { AdminSettingsData } from "@/types/settings.types";
import { DEFAULT_SETTINGS } from "@/data/mockSettings";
import StoreInfoSection from "@/components/admin/settings/StoreInfoSection";
import AdminProfileSection from "@/components/admin/settings/AdminProfileSection";
import ShippingSettingsSection from "@/components/admin/settings/ShippingSettingsSection";
import PaymentMethodsSection from "@/components/admin/settings/PaymentMethodsSection";
import NotificationSettingsSection from "@/components/admin/settings/NotificationSettingsSection";
import SettingsActionButtons from "@/components/admin/settings/SettingsActionButtons";

export default function SettingsPage() {
  const { setMobileOpen } = useMobileMenu();

  // Settings State initialized with mock data
  const [settings, setSettings] = useState<AdminSettingsData>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AdminSettingsData>(DEFAULT_SETTINGS);

  // Status banners
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Store Info
    if (!settings.storeInfo.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }
    if (!settings.storeInfo.phone.trim()) {
      newErrors.phone = "Store phone number is required";
    }
    if (!settings.storeInfo.email.trim()) {
      newErrors.email = "Store email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.storeInfo.email.trim())) {
      newErrors.email = "Please enter a valid store email";
    }
    if (!settings.storeInfo.address.trim()) {
      newErrors.address = "Store address is required";
    }

    // Admin Profile
    if (!settings.adminProfile.name.trim()) {
      newErrors.adminName = "Admin name is required";
    }
    if (!settings.adminProfile.email.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminProfile.email.trim())) {
      newErrors.adminEmail = "Please enter a valid admin email";
    }
    if (!settings.adminProfile.phone.trim()) {
      newErrors.adminPhone = "Admin phone is required";
    }

    // Shipping
    if (isNaN(settings.shipping.shippingCharge) || settings.shipping.shippingCharge < 0) {
      newErrors.shippingCharge = "Shipping charge must be a valid positive amount";
    }
    if (
      isNaN(settings.shipping.freeShippingThreshold) ||
      settings.shipping.freeShippingThreshold < 0
    ) {
      newErrors.freeShippingThreshold = "Free shipping threshold must be a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSave = () => {
    if (!validate()) {
      setSuccessMessage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setSavedSettings(settings);
      setIsSaving(false);
      setSuccessMessage("Settings saved successfully!");
      setInfoMessage(null);

      // Auto dismiss success banner after 4s
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    }, 250);
  };

  const handleCancel = () => {
    setSettings(savedSettings);
    setErrors({});
    setSuccessMessage(null);
    setInfoMessage("Unsaved changes discarded.");
    setTimeout(() => setInfoMessage(null), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setErrors({});
    setSuccessMessage(null);
    setInfoMessage("Settings reset to defaults. Click 'Save Changes' to apply.");
    setTimeout(() => setInfoMessage(null), 4000);
  };

  return (
    <>
      {/* Top Header bar with mobile menu toggle */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 lg:px-12 py-7 space-y-5 max-w-7xl w-full">
        {/* Banner Header Card */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Admin &amp; Store Configuration</span>
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Manage store profile, shipping policies, checkout gateways, and system alerts
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss message"
              className="text-emerald-400/60 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Info Alert Banner */}
        {infoMessage && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 flex items-center justify-between gap-3 text-xs text-sky-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4.5 w-4.5 text-sky-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setInfoMessage(null)}
              aria-label="Dismiss message"
              className="text-sky-400/60 hover:text-sky-300 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Validation Errors Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-xl border border-[#640C0C]/50 bg-[#640C0C]/20 p-3.5 flex items-center gap-2.5 text-xs text-white animate-in fade-in duration-200">
            <AlertCircle className="h-4.5 w-4.5 text-[#640C0C] shrink-0" />
            <span>Please resolve the highlighted field errors below before saving settings.</span>
          </div>
        )}

        {/* Row 1: Balanced 2-Column Grid for Store Information & Admin Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <StoreInfoSection
            data={settings.storeInfo}
            onChange={(patch) =>
              setSettings((prev) => ({
                ...prev,
                storeInfo: { ...prev.storeInfo, ...patch },
              }))
            }
            errors={errors}
          />

          <AdminProfileSection
            data={settings.adminProfile}
            onChange={(patch) =>
              setSettings((prev) => ({
                ...prev,
                adminProfile: { ...prev.adminProfile, ...patch },
              }))
            }
            errors={errors}
          />
        </div>

        {/* Row 2: Balanced 2-Column Grid for Shipping Settings & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <ShippingSettingsSection
            data={settings.shipping}
            onChange={(patch) =>
              setSettings((prev) => ({
                ...prev,
                shipping: { ...prev.shipping, ...patch },
              }))
            }
            errors={errors}
          />

          <PaymentMethodsSection
            data={settings.payments}
            onChange={(patch) =>
              setSettings((prev) => ({
                ...prev,
                payments: { ...prev.payments, ...patch },
              }))
            }
          />
        </div>

        {/* Row 3: Notification Preferences */}
        <NotificationSettingsSection
          data={settings.notifications}
          onChange={(patch) =>
            setSettings((prev) => ({
              ...prev,
              notifications: { ...prev.notifications, ...patch },
            }))
          }
        />

        {/* Sticky Action Buttons Footer */}
        <SettingsActionButtons
          onSave={handleSave}
          onCancel={handleCancel}
          onReset={handleReset}
          isSaving={isSaving}
        />
      </main>
    </>
  );
}
