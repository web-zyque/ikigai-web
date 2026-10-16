"use client";

import { useState } from "react";
import { Menu, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { AdminSettingsData } from "@/types/settings.types";
import { DEFAULT_SETTINGS } from "@/data/mockSettings";

import ShippingSettingsSection from "@/components/admin/settings/ShippingSettingsSection";
import PaymentMethodsSection from "@/components/admin/settings/PaymentMethodsSection";
import SettingsActionButtons from "@/components/admin/settings/SettingsActionButtons";

export default function SettingsPage() {
  const { setMobileOpen } = useMobileMenu();

  const [settings, setSettings] =
    useState<AdminSettingsData>(DEFAULT_SETTINGS);

  const [savedSettings, setSavedSettings] =
    useState<AdminSettingsData>(DEFAULT_SETTINGS);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    JSON.stringify(settings.shipping) !== JSON.stringify(savedSettings.shipping) ||
    JSON.stringify(settings.payments) !== JSON.stringify(savedSettings.payments);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    const shippingCharge = settings.shipping.shippingCharge;
    const freeShippingThreshold = settings.shipping.freeShippingThreshold;

    if (!Number.isFinite(shippingCharge) || shippingCharge < 0) {
      nextErrors.shippingCharge = "Enter a valid, non-negative delivery fee.";
    }

    if (
      !Number.isFinite(freeShippingThreshold) ||
      freeShippingThreshold < 0
    ) {
      nextErrors.freeShippingThreshold =
        "Enter a valid, non-negative free shipping threshold.";
    }

    if (!settings.payments.upiEnabled && !settings.payments.codEnabled) {
      nextErrors.paymentMethods =
        "Enable at least one payment method before saving.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (isSaving || !hasChanges) return;

    if (!validate()) {
      setSuccessMessage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);
    setInfoMessage(null);

    try {

      throw new Error("Settings API integration is not connected yet.");
    } catch (error) {
      setInfoMessage(
        error instanceof Error
          ? error.message
          : "Failed to save settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (!hasChanges) return;

    const confirmed = window.confirm(
      "Discard your unsaved shipping and payment changes?",
    );

    if (!confirmed) return;

    setSettings((current) => ({
      ...current,
      shipping: { ...savedSettings.shipping },
      payments: { ...savedSettings.payments },
    }));

    setErrors({});
    setSuccessMessage(null);
    setInfoMessage(null);
  }

  return (
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 w-full flex flex-col justify-start">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              aria-label="Toggle navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
              Settings
            </h1>
          </div>
        </div>

        <div className="pt-2 pb-3 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Store Configuration
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/40">
            Manage delivery charges, threshold rules, and storefront payment gateways.
          </p>
        </div>
        {successMessage && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              aria-label="Dismiss success message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {infoMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

            <div>
              <p className="font-medium">
                Please review the following settings.
              </p>

              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-300/80">
                {Object.values(errors).map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
          <ShippingSettingsSection
            data={settings.shipping}
            onChange={(patch) => {
              setSettings((previous) => ({
                ...previous,
                shipping: {
                  ...previous.shipping,
                  ...patch,
                },
              }));

              setErrors((previous) => {
                const next = { ...previous };

                if ("shippingCharge" in patch) {
                  delete next.shippingCharge;
                }

                if ("freeShippingThreshold" in patch) {
                  delete next.freeShippingThreshold;
                }

                return next;
              });

              setSuccessMessage(null);
              setInfoMessage(null);
            }}
            errors={errors}
          />

          <div className="space-y-3">
            <PaymentMethodsSection
              data={settings.payments}
              onChange={(patch) => {
                setSettings((previous) => ({
                  ...previous,
                  payments: {
                    ...previous.payments,
                    ...patch,
                  },
                }));

                setErrors((previous) => {
                  const next = { ...previous };
                  delete next.paymentMethods;
                  return next;
                });

                setSuccessMessage(null);
                setInfoMessage(null);
              }}
            />

            {errors.paymentMethods && (
              <p className="text-sm text-red-400" role="alert">
                {errors.paymentMethods}
              </p>
            )}
          </div>
        </div>

        <SettingsActionButtons
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
          hasChanges={hasChanges}
        />
      </main>
  );
}