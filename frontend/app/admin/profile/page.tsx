"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Menu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Hash,
} from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { useMe } from "@/hooks/auth";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-3.5 w-3.5 text-white/40" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-white truncate">
          {value || <span className="text-white/25 font-normal">—</span>}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5">
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { setMobileOpen } = useMobileMenu();
  const { data: user, isLoading } = useMe();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const roleLabel =
    user?.role === "STAFF" ? "Staff" : user?.role === "ADMIN" ? "Administrator" : user?.role ?? "—";

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setIsSaving(true);
    // Stub — wire up to auth service when endpoint is ready
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    setPasswordSuccess(true);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  if (isLoading) {
    return (
      <>
        <header className="sticky top-0 z-30 flex h-20 w-full items-center border-b border-white/5 bg-black/90 px-6 lg:px-8 backdrop-blur-md">
          <div className="h-5 w-32 rounded-lg bg-white/5 animate-pulse" />
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="h-64 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
            <div className="lg:col-span-2 h-64 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Page header */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 lg:px-8 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#640C0C] lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
            My Profile
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 w-full">
        {/* Page title row */}
        <div className="pb-3 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            My Profile
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-white/40">
            Your account information and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* ── Left: identity card ── */}
          <div className="space-y-5">
            {/* Avatar + name */}
            <div className="rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden">
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#640C0C] border-2 border-white/10 text-2xl font-bold text-white shadow-lg shadow-[#640C0C]/20">
                  {initials}
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-white">
                    {user?.fullName ?? "—"}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#640C0C]/15 border border-[#640C0C]/30 px-3 py-0.5 text-xs font-medium text-[#640C0C]">
                    <Shield className="h-3 w-3" />
                    {roleLabel}
                  </span>
                </div>
              </div>

              {user?.adminId && (
                <div className="border-t border-white/5 px-6 py-3 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-xs text-white/40">Admin ID</span>
                  <span className="ml-auto text-xs font-mono text-white/60">
                    {user.adminId}
                  </span>
                </div>
              )}

              <div className="border-t border-white/5 px-6 py-3 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    user?.isActive !== false ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                <span className="text-xs text-white/40">Status</span>
                <span className="ml-auto text-xs font-medium text-white/70">
                  {user?.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {user?.createdAt && (
                <div className="border-t border-white/5 px-6 py-3 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-xs text-white/40">Member since</span>
                  <span className="ml-auto text-xs text-white/60">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: details + security ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Account info */}
            <SectionCard
              title="Account Information"
              description="Details associated with this admin account."
            >
              <InfoRow icon={User} label="Full name" value={user?.fullName} />
              <InfoRow icon={Mail} label="Email address" value={user?.email} />
              <InfoRow icon={Phone} label="Phone number" value={user?.phone} />
              <InfoRow icon={Shield} label="Role" value={roleLabel} />
            </SectionCard>

            {/* Change password */}
            <SectionCard
              title="Change Password"
              description="Update your login password. Use at least 8 characters."
            >
              {passwordSuccess && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Password updated successfully.
                </div>
              )}

              {passwordError && (
                <div
                  role="alert"
                  className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {(
                  [
                    {
                      id: "current",
                      label: "Current password",
                      show: showCurrent,
                      toggle: () => setShowCurrent((v) => !v),
                    },
                    {
                      id: "newPass",
                      label: "New password",
                      show: showNew,
                      toggle: () => setShowNew((v) => !v),
                    },
                    {
                      id: "confirm",
                      label: "Confirm new password",
                      show: showConfirm,
                      toggle: () => setShowConfirm((v) => !v),
                    },
                  ] as const
                ).map(({ id, label, show, toggle }) => (
                  <div key={id}>
                    <label
                      htmlFor={`pw-${id}`}
                      className="mb-1.5 block text-xs text-white/40"
                    >
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        id={`pw-${id}`}
                        type={show ? "text" : "password"}
                        value={passwordForm[id]}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:ring-0 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {show ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Key className="h-3.5 w-3.5" />
                    {isSaving ? "Saving…" : "Update Password"}
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>
        </div>
      </main>
    </>
  );
}