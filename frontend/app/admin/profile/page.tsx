"use client";

import React, { useState, useEffect } from "react";
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
  Pencil,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { useMe, useUpdateAdminProfile, useChangeAdminPassword } from "@/hooks/auth";

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5">
        <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldRow({ icon: Icon, label, value }: {
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
          {value || <span className="text-white/25 font-normal italic">Not set</span>}
        </p>
      </div>
    </div>
  );
}

function EditableField({ icon: Icon, label, type = "text", value, onChange, placeholder, disabled }: {
  icon: React.ElementType;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon className="h-3.5 w-3.5 text-white/40" />
      </div>
      <div className="min-w-0 flex-1">
        <label className="text-xs text-white/40 mb-1 block">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors disabled:opacity-40"
        />
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { setMobileOpen } = useMobileMenu();
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateAdminProfile();
  const changePassword = useChangeAdminPassword();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "" });
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwClientError, setPwClientError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (user) setEditForm({ fullName: user.fullName ?? "", email: user.email ?? "" });
  }, [user]);

  const initials = user?.fullName
    ? user.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  const roleLabel =
    user?.role === "STAFF" ? "Staff" : user?.role === "ADMIN" ? "Administrator" : "—";

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (editForm.fullName.trim() && editForm.fullName.trim() !== user?.fullName)
      payload.fullName = editForm.fullName.trim();
    if (editForm.email.trim() && editForm.email.trim() !== user?.email)
      payload.email = editForm.email.trim();
    if (Object.keys(payload).length === 0) { setIsEditing(false); return; }
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setIsEditing(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 4000);
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwClientError("");
    setPwSuccess(false);
    if (!pwForm.current || !pwForm.newPass || !pwForm.confirm) {
      setPwClientError("All fields are required."); return;
    }
    if (pwForm.newPass !== pwForm.confirm) {
      setPwClientError("New passwords do not match."); return;
    }
    if (pwForm.newPass.length < 8) {
      setPwClientError("New password must be at least 8 characters."); return;
    }
    if (pwForm.current === pwForm.newPass) {
      setPwClientError("New password must differ from your current password."); return;
    }
    changePassword.mutate(
      { currentPassword: pwForm.current, newPassword: pwForm.newPass },
      {
        onSuccess: () => {
          setPwForm({ current: "", newPass: "", confirm: "" });
          setPwSuccess(true);
          setTimeout(() => setPwSuccess(false), 5000);
        },
        onError: (err) => setPwClientError(err.message ?? "Failed to change password."),
      }
    );
  };

  if (isLoading) {
    return (
      <>
        <header className="sticky top-0 z-30 flex h-20 w-full items-center border-b border-white/5 bg-black/90 px-6 lg:px-8 backdrop-blur-md">
          <div className="h-5 w-32 rounded-lg bg-white/5 animate-pulse" />
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="h-72 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
            <div className="lg:col-span-2 h-72 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
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
          <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">My Profile</h1>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="space-y-5">
            <div className="rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden">
              <div className="flex flex-col items-center gap-4 px-6 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#640C0C] border-2 border-white/10 text-2xl font-bold text-white shadow-lg shadow-[#640C0C]/20">
                  {initials}
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-white">{user?.fullName ?? "—"}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#640C0C]/15 border border-[#640C0C]/30 px-3 py-0.5 text-xs font-medium text-[#640C0C]">
                    <Shield className="h-3 w-3" />
                    {roleLabel}
                  </span>
                </div>
              </div>
              {user?.adminId && (
                <div className="border-t border-white/5 px-5 py-3 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-xs text-white/40">Admin ID</span>
                  <span className="ml-auto text-xs font-mono text-white/60 select-all">{user.adminId}</span>
                </div>
              )}
              <div className="border-t border-white/5 px-5 py-3 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${user?.isActive !== false ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs text-white/40">Status</span>
                <span className="ml-auto text-xs font-medium text-white/70">
                  {user?.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
              {user?.createdAt && (
                <div className="border-t border-white/5 px-5 py-3 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-white/30" />
                  <span className="text-xs text-white/40">Member since</span>
                  <span className="ml-auto text-xs text-white/60">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
            <SectionCard
              title="Account Information"
              description={isEditing ? "Edit your details below, then save." : "Your account details."}
            >
              {profileSuccess && (
                <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Profile updated successfully.
                </div>
              )}
              {updateProfile.isError && (
                <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {updateProfile.error?.message ?? "Failed to update profile."}
                </div>
              )}
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <EditableField icon={User} label="Full name" value={editForm.fullName}
                    onChange={(v) => setEditForm((p) => ({ ...p, fullName: v }))}
                    placeholder="Your full name" disabled={updateProfile.isPending} />
                  <EditableField icon={Mail} label="Email address" type="email" value={editForm.email}
                    onChange={(v) => setEditForm((p) => ({ ...p, email: v }))}
                    placeholder="admin@example.com" disabled={updateProfile.isPending} />
                  <FieldRow icon={Phone} label="Phone" value={user?.phone} />
                  <FieldRow icon={Shield} label="Role" value={roleLabel} />
                  <div className="pt-4 flex items-center gap-3">
                    <button type="submit" disabled={updateProfile.isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {updateProfile.isPending ? "Saving…" : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} disabled={updateProfile.isPending}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50">
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <FieldRow icon={User} label="Full name" value={user?.fullName} />
                  <FieldRow icon={Mail} label="Email address" value={user?.email} />
                  <FieldRow icon={Phone} label="Phone" value={user?.phone} />
                  <FieldRow icon={Shield} label="Role" value={roleLabel} />
                  <div className="pt-4">
                    <button type="button" onClick={() => { setEditForm({ fullName: user?.fullName ?? "", email: user?.email ?? "" }); setIsEditing(true); setProfileSuccess(false); }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </SectionCard>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-[20px] bg-[#121212] border border-white/10 p-6 sm:p-8">
              {pwSuccess && (
                <div role="status" className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Password changed successfully.</span>
                </div>
              )}
              {(pwClientError || changePassword.isError) && (
                <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{pwClientError || changePassword.error?.message}</span>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handlePasswordSubmit} className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        required
                        value={pwForm.current}
                        onChange={(e) => { setPwForm((p) => ({ ...p, current: e.target.value })); setPwClientError(""); }}
                        placeholder="••••••••"
                        disabled={changePassword.isPending}
                        className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 pr-11 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
                      />
                      <button type="button" onClick={() => setShowCurrent((s) => !s)}
                        aria-label={showCurrent ? "Hide" : "Show"}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          required
                          value={pwForm.newPass}
                          onChange={(e) => { setPwForm((p) => ({ ...p, newPass: e.target.value })); setPwClientError(""); }}
                          placeholder="Min 8 characters"
                          disabled={changePassword.isPending}
                          className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 pr-11 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
                        />
                        <button type="button" onClick={() => setShowNew((s) => !s)}
                          aria-label={showNew ? "Hide" : "Show"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          required
                          value={pwForm.confirm}
                          onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwClientError(""); }}
                          placeholder="Confirm password"
                          disabled={changePassword.isPending}
                          className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 pr-11 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none disabled:opacity-50"
                        />
                        <button type="button" onClick={() => setShowConfirm((s) => !s)}
                          aria-label={showConfirm ? "Hide" : "Show"}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={changePassword.isPending}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {changePassword.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                      {changePassword.isPending ? "Saving…" : "Update Password"}
                    </button>
                  </div>
                </form>
                <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Key className="h-4 w-4 text-[#640C0C]" />
                    <span>Password Guidelines</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-white/50 leading-relaxed list-disc list-inside">
                    <li>Use a combination of uppercase, lowercase letters and numbers.</li>
                    <li>Minimum 8 characters in length.</li>
                    <li>Avoid using common phrases or personal information.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}