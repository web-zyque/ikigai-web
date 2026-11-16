"use client";

import React, { useState, useEffect } from "react";
import { Menu, Eye, EyeOff, X } from "lucide-react";
import { useMobileMenu } from "@/contexts/admin-layout-context";
import { useMe, useUpdateAdminProfile, useChangeAdminPassword } from "@/hooks/auth";

export default function AdminProfilePage() {
  const { setMobileOpen } = useMobileMenu();
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateAdminProfile();
  const changePassword = useChangeAdminPassword();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", email: "" });
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [pwForm, setPwForm] = useState({ current: "", newPass: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwClientError, setPwClientError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const roleLabel =
    user?.role === "STAFF" ? "Staff" : user?.role === "ADMIN" ? "Administrator" : "—";

  const handleOpenEdit = () => {
    setEditForm({
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
    });
    setIsEditModalOpen(true);
    setProfileSuccess(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (editForm.fullName.trim() && editForm.fullName.trim() !== user?.fullName) {
      payload.fullName = editForm.fullName.trim();
    }
    if (editForm.email.trim() && editForm.email.trim() !== user?.email) {
      payload.email = editForm.email.trim();
    }
    if (Object.keys(payload).length === 0) {
      setIsEditModalOpen(false);
      return;
    }
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setIsEditModalOpen(false);
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
      setPwClientError("All fields are required.");
      return;
    }
    if (pwForm.newPass !== pwForm.confirm) {
      setPwClientError("New passwords do not match.");
      return;
    }
    if (pwForm.newPass.length < 8) {
      setPwClientError("New password must be at least 8 characters.");
      return;
    }
    if (pwForm.current === pwForm.newPass) {
      setPwClientError("New password must differ from your current password.");
      return;
    }

    changePassword.mutate(
      { currentPassword: pwForm.current, newPassword: pwForm.newPass },
      {
        onSuccess: () => {
          setPwForm({ current: "", newPass: "", confirm: "" });
          setPwSuccess(true);
          setTimeout(() => {
            setPwSuccess(false);
            setIsPasswordModalOpen(false);
          }, 1500);
        },
        onError: (err) => {
          setPwClientError(err.message ?? "Failed to change password.");
        },
      }
    );
  };

  const resetPasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPwForm({ current: "", newPass: "", confirm: "" });
    setPwClientError("");
    setPwSuccess(false);
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 w-full flex flex-col justify-start">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="h-80 rounded-[20px] bg-[#121212] border border-white/10 animate-pulse" />
          <div className="lg:col-span-2 h-80 rounded-[20px] bg-[#121212] border border-white/10 animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 w-full flex flex-col justify-start">
        <div className="flex items-center justify-between pb-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 rounded-[20px] bg-[#121212] border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Overview
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                <span
                  className={`h-2 w-2 rounded-full ${
                    user?.isActive !== false ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {user?.isActive !== false ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 px-6 py-7">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#640C0C] border-2 border-white/10 text-2xl font-bold text-white shadow-lg shadow-[#640C0C]/20">
                {initials}
              </div>
              <div className="text-center mt-1">
                <p className="text-base font-semibold text-white">{user?.fullName ?? "—"}</p>
                <p className="text-xs text-white/40 mt-0.5 truncate max-w-[240px]">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 divide-y divide-white/5 text-xs">
              {user?.adminId && (
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <span className="text-white/40">Admin ID</span>
                  <span className="font-mono text-white/80 select-all">{user.adminId}</span>
                </div>
              )}
              {user?.createdAt && (
                <div className="px-6 py-3.5 flex items-center justify-between">
                  <span className="text-white/40">Member Since</span>
                  <span className="text-white/80">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-white/40">Phone</span>
                <span className="text-white/80">{user?.phone || "Not set"}</span>
              </div>
              <div className="px-6 py-3.5 flex items-center justify-between">
                <span className="text-white/40">Role</span>
                <span className="font-medium text-white/80">{roleLabel}</span>
              </div>
            </div>

            <div className="p-4 bg-[#0a0a0a]/50 border-t border-white/5 text-center">
              <span className="text-[11px] font-medium text-white/35">
                Full administrator access granted
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-[20px] bg-[#121212] border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-white">
                  Account Information
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Your personal contact and account credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenEdit}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            <div className="p-6 space-y-5">
              {profileSuccess && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-400"
                >
                  Profile updated successfully.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Full Name
                  </label>
                  <div className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 flex items-center text-xs font-medium text-white">
                    {user?.fullName || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Email Address
                  </label>
                  <div className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 flex items-center text-xs font-medium text-white truncate">
                    {user?.email || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Phone Number
                  </label>
                  <div className="w-full h-11 rounded-xl bg-[#0a0a0a]/50 border border-white/5 px-3.5 flex items-center text-xs text-white/50">
                    {user?.phone || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Account Role
                  </label>
                  <div className="w-full h-11 rounded-xl bg-[#0a0a0a]/50 border border-white/5 px-3.5 flex items-center text-xs text-white/50">
                    {roleLabel}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white">Password & Security</p>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Need to update your account password? Change credentials in popup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#0a0a0a]">
              <div>
                <h3 className="text-base font-semibold text-white">Edit Profile</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Update your personal administrator details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close modal"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
              {updateProfile.isError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-400"
                >
                  {updateProfile.error?.message ?? "Failed to update profile."}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Enter your full name"
                  disabled={updateProfile.isPending}
                  className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 text-xs text-white placeholder:text-white/25 focus:border-[#640C0C] focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="admin@example.com"
                  disabled={updateProfile.isPending}
                  className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 text-xs text-white placeholder:text-white/25 focus:border-[#640C0C] focus:outline-none transition-colors disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={user?.phone || ""}
                    disabled
                    className="w-full h-11 rounded-xl bg-[#0a0a0a]/50 border border-white/5 px-3.5 text-xs text-white/40 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Account Role
                  </label>
                  <input
                    type="text"
                    value={roleLabel}
                    disabled
                    className="w-full h-11 rounded-xl bg-[#0a0a0a]/50 border border-white/5 px-3.5 text-xs text-white/40 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={updateProfile.isPending}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={resetPasswordModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#0a0a0a]">
              <div>
                <h3 className="text-base font-semibold text-white">Update Password</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Set a new, secure password for your administrator account
                </p>
              </div>
              <button
                type="button"
                onClick={resetPasswordModal}
                aria-label="Close modal"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 overflow-y-auto">
              {pwSuccess && (
                <div
                  role="status"
                  className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs font-medium text-emerald-400"
                >
                  Password changed successfully.
                </div>
              )}

              {(pwClientError || changePassword.isError) && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs font-medium text-red-400"
                >
                  {pwClientError || changePassword.error?.message}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={pwForm.current}
                    onChange={(e) => {
                      setPwForm((prev) => ({ ...prev, current: e.target.value }));
                      setPwClientError("");
                    }}
                    placeholder="Enter current password"
                    disabled={changePassword.isPending}
                    className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 pr-10 text-xs text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={pwForm.newPass}
                    onChange={(e) => {
                      setPwForm((prev) => ({ ...prev, newPass: e.target.value }));
                      setPwClientError("");
                    }}
                    placeholder="Minimum 8 characters"
                    disabled={changePassword.isPending}
                    className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 pr-10 text-xs text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    aria-label={showNew ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={pwForm.confirm}
                    onChange={(e) => {
                      setPwForm((prev) => ({ ...prev, confirm: e.target.value }));
                      setPwClientError("");
                    }}
                    placeholder="Re-enter new password"
                    disabled={changePassword.isPending}
                    className="w-full h-11 rounded-xl bg-[#0a0a0a] border border-white/10 px-3.5 pr-10 text-xs text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3.5 space-y-1.5">
                <p className="text-xs font-semibold text-white">Password Guidelines</p>
                <ul className="text-[11px] text-white/45 space-y-1 list-disc list-inside">
                  <li>Minimum 8 characters in length</li>
                  <li>Use a combination of letters, numbers, and symbols</li>
                  <li>Must differ from your current password</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetPasswordModal}
                  disabled={changePassword.isPending}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
