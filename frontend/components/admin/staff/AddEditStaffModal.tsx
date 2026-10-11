"use client";

import React, { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck } from "lucide-react";
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

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(STAFF_ROLES[0] as string);
  const [customRole, setCustomRole] = useState("");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [joinDate, setJoinDate] = useState("");
  const [status, setStatus] = useState<StaffStatus>("Active");

  // Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or pre-fill form when modal opens or staffToEdit changes
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
        // Default new staff form
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setRole(STAFF_ROLES[0]);
        setCustomRole("");
        setIsCustomRole(false);
        // Default join date to today (YYYY-MM-DD)
        const todayStr = new Date().toISOString().split("T")[0];
        setJoinDate(todayStr);
        setStatus("Active");
      }
      setErrors({});
    }
  }, [isOpen, staffToEdit]);

  // Handle ESC key and body scroll lock
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#0a0a0a]">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>{isEditing ? "Edit Staff Member" : "Add New Staff Member"}</span>
              {isEditing && (
                <span className="font-mono text-xs text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  {staffToEdit?.id}
                </span>
              )}
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              {isEditing
                ? "Update member details, assigned role, or account status"
                : "Fill in the details below to register a new staff member"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            {/* Row 1: Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Full Name <span className="text-[#640C0C]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full rounded-xl border ${
                      errors.name ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                    } bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Role / Position <span className="text-[#640C0C]">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
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
                    className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors cursor-pointer"
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
            </div>

            {/* Custom Role Input if Other selected */}
            {isCustomRole && (
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Specify Custom Role <span className="text-[#640C0C]">*</span>
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  placeholder="e.g. Senior Diagnostic Specialist"
                  className={`w-full rounded-xl border ${
                    errors.role ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                  } bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
                />
                {errors.role && (
                  <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.role}</p>
                )}
              </div>
            )}

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Email Address <span className="text-[#640C0C]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="e.g. rahul@ikigai-auto.com"
                    className={`w-full rounded-xl border ${
                      errors.email ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                    } bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Phone Number <span className="text-[#640C0C]">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="+91 98765 43210"
                    className={`w-full rounded-xl border ${
                      errors.phone ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                    } bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Row 3: Address */}
            <div>
              <label className="block font-medium text-white/80 mb-1.5">
                Address <span className="text-[#640C0C]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-white/40 pointer-events-none" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  placeholder="Street address, city, state, pincode"
                  className={`w-full rounded-xl border ${
                    errors.address ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                  } bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors resize-none`}
                />
              </div>
              {errors.address && (
                <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.address}</p>
              )}
            </div>

            {/* Row 4: Join Date & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Join Date */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Join Date <span className="text-[#640C0C]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => {
                      setJoinDate(e.target.value);
                      if (errors.joinDate) setErrors((prev) => ({ ...prev, joinDate: "" }));
                    }}
                    className={`w-full rounded-xl border ${
                      errors.joinDate ? "border-[#640C0C] ring-1 ring-[#640C0C]" : "border-white/10"
                    } bg-[#0a0a0a] pl-10 pr-3.5 py-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors [color-scheme:dark]`}
                  />
                </div>
                {errors.joinDate && (
                  <p className="text-[#640C0C] text-[11px] mt-1 font-medium">{errors.joinDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium text-white/80 mb-1.5">
                  Account Status <span className="text-[#640C0C]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setStatus("Active")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      status === "Active"
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                        : "border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Inactive")}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      status === "Inactive"
                        ? "border-white/30 bg-white/10 text-white ring-1 ring-white/20"
                        : "border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white"
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
          <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
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
