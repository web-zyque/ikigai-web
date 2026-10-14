"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Edit,
  Power,
  Trash2,
} from "lucide-react";
import { StaffMember } from "@/types/staff.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export interface StaffDetailsModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: StaffMember) => void;
  onToggleStatus: (staffId: string) => void;
  onDelete?: (staff: StaffMember) => void;
}

export default function StaffDetailsModal({
  staff,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: StaffDetailsModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

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
    <>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col w-full max-w-xl max-h-[90vh] bg-[#121212] text-white border border-white/10 rounded-[20px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Top Bar with Name, ID, and Close */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 bg-[#0e0e0e]">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                {staff.name}
              </h2>
              <span className="font-mono text-xs text-white/50">
                #{staff.id}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons at the Top: Edit, Inactivate / Activate, Delete */}
          <div className="px-6 py-3 border-b border-white/10 bg-[#121212] flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                onEdit(staff);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Staff</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStatusDialogOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${isStaffActive
                ? "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
                }`}
            >
              <Power className="h-3.5 w-3.5" />
              <span>{isStaffActive ? "Deactivate" : "Activate"}</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Scrollable Center Modal Body with Line-Separated Design */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Top Metric Bar with Line Separation */}
            <div className="pt-3 pb-5 border-y border-white/10">
              <div className="grid grid-cols-2 divide-x divide-white/10">
                <div className="flex flex-col justify-between pr-4 sm:pr-6">
                  <span className="text-xs font-medium text-white/50">Role &amp; Position</span>
                  <div className="mt-2">
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                      {staff.role}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-white/40">Department assignment</span>
                </div>

                <div className="flex flex-col justify-between pl-4 sm:pl-6">
                  <span className="text-xs font-medium text-white/50">Account Status</span>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${isStaffActive ? "bg-emerald-400" : "bg-white/40"
                        }`}
                    />
                    <span
                      className={`text-lg sm:text-xl font-bold tracking-tight ${isStaffActive ? "text-emerald-400" : "text-white/40"
                        }`}
                    >
                      {staff.status}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-white/40">Portal access state</span>
                </div>
              </div>
            </div>

            {/* Line-Separated Contact Information */}
            <div className="pt-3 pb-5 border-b border-white/10 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-4 sm:gap-y-0">
                <div className="pr-0 sm:pr-6">
                  <span className="text-xs text-white/40 block mb-1">Email Address</span>
                  <span className="text-sm font-medium text-white/90 break-all font-mono">
                    {staff.email}
                  </span>
                </div>

                <div className="pt-3 sm:pt-0 pl-0 sm:pl-6">
                  <span className="text-xs text-white/40 block mb-1">Phone Number</span>
                  <span className="text-sm font-medium font-mono text-white/90">
                    {staff.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Line-Separated Address Information */}
            <div className="pt-3 pb-5 border-b border-white/10 space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                Address
              </span>
              <p className="text-sm text-white/80 leading-relaxed">
                {staff.address || "No address provided"}
              </p>
            </div>

            {/* Line-Separated Dates Section */}
            <div className="pt-3 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-3 sm:gap-y-0">
                <div className="pr-0 sm:pr-6">
                  <span className="text-xs text-white/40 block mb-1">Join Date</span>
                  <span className="font-mono text-sm font-medium text-white/80">
                    {formatJoinDate(staff.joinDate)}
                  </span>
                </div>
                <div className="pt-3 sm:pt-0 pl-0 sm:pl-6">
                  <span className="text-xs text-white/40 block mb-1">Staff Identifier</span>
                  <span className="font-mono text-sm font-medium text-white/80">
                    {staff.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Deactivation / Activation Dialog */}
      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={() => {
          setIsStatusDialogOpen(false);
          onToggleStatus(staff.id);
        }}
        title={`${isStaffActive ? "Deactivate" : "Activate"} Staff Member`}
        description={`Are you sure you want to mark ${staff.name} as ${isStaffActive ? "Inactive" : "Active"
          }? ${isStaffActive
            ? "They will no longer be able to log in to the administrative portal."
            : "Their system credentials and access will be re-enabled."
          }`}
        confirmText={isStaffActive ? "Deactivate Staff" : "Activate Staff"}
        variant={isStaffActive ? "warning" : "info"}
      />

      {/* Confirm Delete Dialog */}
      {onDelete && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            setIsDeleteDialogOpen(false);
            onClose();
            onDelete(staff);
          }}
          title="Delete Staff Member"
          description={`This action cannot be undone. Are you sure you want to permanently delete the profile for ${staff.name} (${staff.id})?`}
          confirmText="Delete Permanently"
          variant="danger"
        />
      )}
    </>
  );
}
