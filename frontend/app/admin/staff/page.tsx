"use client";

import React, { useState } from "react";
import { Menu, UserPlus } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { StaffMember, StaffFormData } from "@/types/staff.types";
import { INITIAL_MOCK_STAFF } from "@/data/mockStaff";
import StaffTable from "@/components/admin/staff/StaffTable";
import AddEditStaffModal from "@/components/admin/staff/AddEditStaffModal";
import StaffDetailsModal from "@/components/admin/staff/StaffDetailsModal";

export default function StaffPage() {
  const { setMobileOpen } = useMobileMenu();

  // Staff State initialized with mock data
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_MOCK_STAFF);

  // Modal States
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  // Handlers
  const handleOpenAdd = () => {
    setStaffToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setStaffToEdit(staff);
    setIsAddEditModalOpen(true);
  };

  const handleOpenView = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDetailsModalOpen(true);
  };

  const handleToggleStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((member) =>
        member.id === staffId
          ? {
              ...member,
              status: member.status === "Active" ? "Inactive" : "Active",
            }
          : member
      )
    );

    // Keep selected staff synced if currently open in view modal
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) =>
        prev
          ? {
              ...prev,
              status: prev.status === "Active" ? "Inactive" : "Active",
            }
          : null
      );
    }
  };

  const handleSaveStaff = (data: StaffFormData, staffId?: string) => {
    if (staffId) {
      // Editing existing staff
      setStaffList((prev) =>
        prev.map((member) =>
          member.id === staffId
            ? {
                ...member,
                ...data,
              }
            : member
        )
      );

      if (selectedStaff && selectedStaff.id === staffId) {
        setSelectedStaff((prev) =>
          prev
            ? {
                ...prev,
                ...data,
              }
            : null
        );
      }
    } else {
      // Adding new staff
      // Calculate next Staff ID
      const maxNumericId = staffList.reduce((max, member) => {
        const num = parseInt(member.id.replace(/\D/g, ""), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 1000);

      const newId = `STF-${maxNumericId + 1}`;

      const newStaffMember: StaffMember = {
        id: newId,
        ...data,
      };

      setStaffList((prev) => [newStaffMember, ...prev]);
    }
  };

  return (
    <>
      {/* Top Header bar with mobile menu toggle and Add Staff button */}
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
            <h1 className="text-xl font-bold tracking-tight text-white">Staff Management</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 lg:px-12 py-8 space-y-6 max-w-7xl w-full">
        {/* Staff Table Directory with Search, Filters, List, & Actions */}
        <StaffTable
          staffList={staffList}
          onViewStaff={handleOpenView}
          onEditStaff={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
        />
      </main>

      {/* View Staff Details Modal */}
      <StaffDetailsModal
        staff={selectedStaff}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStaff(null);
        }}
        onEdit={(staff) => {
          handleOpenEdit(staff);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit Staff Modal */}
      <AddEditStaffModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setStaffToEdit(null);
        }}
        onSave={handleSaveStaff}
        staffToEdit={staffToEdit}
      />
    </>
  );
}
