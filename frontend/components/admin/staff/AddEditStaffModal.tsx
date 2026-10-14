"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { StaffMember, StaffFormData, StaffStatus, STAFF_ROLES } from "@/types/staff.types";

export interface AddEditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData, staffId?: string) => void;
  staffToEdit?: StaffMember | null;
}

export default function AddEditStaffModal({
  isOpen,
  onClose,
  onSave,
  staffToEdit,
}: AddEditStaffModalProps) {
  const isEditing = Boolean(staffToEdit);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(STAFF_ROLES[0] as string);
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [joinDate, setJoinDate] = useState("");
  const [status, setStatus] = useState<StaffStatus>("Active");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (staffToEdit) {
        setName(staffToEdit.name);
        setEmail(staffToEdit.email);
        setPhone(staffToEdit.phone);
        setAddress(staffToEdit.address);
        setStatus(staffToEdit.status);
        setJoinDate(staffToEdit.joinDate);

        if (STAFF_ROLES.includes(staffToEdit.role as any)) {
          setRole(staffToEdit.role);
          setIsCustomRole(false);
          setCustomRole("");
        } else {
          setRole("Other");
          setIsCustomRole(true);
          setCustomRole(staffToEdit.role);
        }
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setRole(STAFF_ROLES[0]);
        setCustomRole("");
        setIsCustomRole(false);
        const todayStr = new Date().toISOString().split("T")[0];
        setJoinDate(todayStr);
        setStatus("Active");
      }
      setErrors({});
    }
  }, [isOpen, staffToEdit]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (isCustomRole && !customRole.trim()) {
      newErrors.role = "Custom role title is required";
    }

    if (!joinDate.trim()) {
      newErrors.joinDate = "Join date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalRole = isCustomRole ? customRole.trim() : role;

    onSave(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role: finalRole,
        joinDate,
        status,
      },
      staffToEdit?.id
    );

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl flex flex-col rounded-[24px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-7 pt-6 pb-4 bg-[#0a0a0a]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">
                {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>
              {isEditing && (
                <span className="font-mono text-xs text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                  {staffToEdit?.id}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              {isEditing
                ? "Update member details, assigned role, or account status"
                : "Fill in the details below to register a new staff member"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-[#640C0C] transition-colors cursor-pointer shrink-0 ml-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-7 space-y-5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Row 1: Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  {errors.name && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                    errors.name
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Role / Position <span className="text-red-400">*</span>
                  </label>
                  {errors.role && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.role}
                    </span>
                  )}
                </div>
                <select
                  value={isCustomRole ? "Other" : role}
                  onChange={(e) => {
                    if (e.target.value === "Other") {
                      setIsCustomRole(true);
                    } else {
                      setIsCustomRole(false);
                      setRole(e.target.value);
                    }
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white outline-none focus:border-white/30 transition-colors cursor-pointer"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#121212] text-white">
                      {r}
                    </option>
                  ))}
                  <option value="Other" className="bg-[#121212] text-white">
                    Other (Custom Role)
                  </option>
                </select>
              </div>
            </div>

            {/* Custom Role Input if Other selected */}
            {isCustomRole && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 block">
                  Specify Custom Role <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  placeholder="e.g. Senior Diagnostic Specialist"
                  className="w-full h-12 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition-colors"
                />
              </div>
            )}

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Email */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  {errors.email && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="e.g. rahul@ikigai-auto.com"
                  className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white placeholder-white/30 outline-none transition-colors ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  {errors.phone && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm font-mono text-white placeholder-white/30 outline-none transition-colors ${
                    errors.phone
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>
            </div>

            {/* Row 3: Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">
                  Address <span className="text-red-400">*</span>
                </label>
                {errors.address && (
                  <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3 w-3" /> {errors.address}
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                }}
                placeholder="Street address, city, state, pincode"
                className={`w-full rounded-[20px] bg-[#0a0a0a] border p-4 text-sm text-white placeholder-white/30 outline-none transition-colors resize-none ${
                  errors.address
                    ? "border-red-500/50 focus:border-red-500"
                    : "border-white/10 focus:border-white/30"
                }`}
              />
            </div>

            {/* Row 4: Join Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Join Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">
                    Join Date <span className="text-red-400">*</span>
                  </label>
                  {errors.joinDate && (
                    <span className="text-xs text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> {errors.joinDate}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => {
                    setJoinDate(e.target.value);
                    if (errors.joinDate) setErrors((prev) => ({ ...prev, joinDate: "" }));
                  }}
                  className={`w-full h-12 rounded-full bg-[#0a0a0a] border px-4 text-sm text-white outline-none transition-colors [color-scheme:dark] ${
                    errors.joinDate
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-white/30"
                  }`}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 block">
                  Account Status <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 h-12">
                  <button
                    type="button"
                    onClick={() => setStatus("Active")}
                    className={`flex items-center justify-center gap-2 h-full rounded-full border text-xs font-medium transition-all cursor-pointer ${
                      status === "Active"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-white/10 bg-[#0a0a0a] text-white/50 hover:text-white"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Inactive")}
                    className={`flex items-center justify-center gap-2 h-full rounded-full border text-xs font-medium transition-all cursor-pointer ${
                      status === "Inactive"
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-[#0a0a0a] text-white/50 hover:text-white"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white/40" />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-7 py-4 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-6 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-lg cursor-pointer"
            >
              {isEditing ? "Save Changes" : "Add Staff Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
