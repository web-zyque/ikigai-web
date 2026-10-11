"use client";

import React, { useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { StaffMember, StaffStatus } from "@/types/staff.types";

export interface StaffDetailsModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: StaffMember) => void;
  onToggleStatus: (staffId: string) => void;
}

export default function StaffDetailsModal({
  staff,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}: StaffDetailsModalProps) {
  // Lock body scroll and listen for Escape key
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

  if (!isOpen || !staff) return null;

  // Helper: Format Date
  const formatJoinDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isStaffActive = staff.status === "Active";

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#640C0C]/30 border border-[#640C0C]/50 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {staff.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">{staff.name}</h2>
                <span className="font-mono text-[11px] text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  {staff.id}
                </span>
              </div>
              <p className="text-xs text-white/50">{staff.role}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status & Role Highlight Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-white/40">Status:</span>
              {isStaffActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  Inactive
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(staff.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isStaffActive
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              Set to {isStaffActive ? "Inactive" : "Active"}
            </button>
          </div>

          {/* Details Grid */}
          <div className="space-y-3.5">
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 text-[11px] flex items-center gap-1.5 mb-1">
                  <Mail className="h-3.5 w-3.5 text-white/40" />
                  Email Address
                </span>
                <p className="font-medium text-white truncate">{staff.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 text-[11px] flex items-center gap-1.5 mb-1">
                  <Phone className="h-3.5 w-3.5 text-white/40" />
                  Phone Number
                </span>
                <p className="font-mono text-white/90">{staff.phone}</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 text-[11px] flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5 text-white/40" />
                Residential / Work Address
              </span>
              <p className="text-white/80 leading-relaxed">{staff.address}</p>
            </div>

            {/* Join Date & Role Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 text-[11px] flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-white/40" />
                  Date of Joining
                </span>
                <p className="font-medium text-white">{formatJoinDate(staff.joinDate)}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 text-[11px] flex items-center gap-1.5 mb-1">
                  <Briefcase className="h-3.5 w-3.5 text-white/40" />
                  Assigned Department / Role
                </span>
                <p className="font-medium text-white">{staff.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-[#0a0a0a]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(staff);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-95 shadow-md cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Staff Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
