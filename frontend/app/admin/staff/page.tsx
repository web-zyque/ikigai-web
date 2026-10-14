"use client";

import React, { useState, useMemo } from "react";
import { Menu, Plus } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { StaffMember, StaffFormData } from "@/types/staff.types";
import { INITIAL_MOCK_STAFF } from "@/data/mockStaff";
import StaffSummaryCards, { StaffCounts } from "@/components/admin/staff/StaffSummaryCards";
import StaffTable from "@/components/admin/staff/StaffTable";
import AddEditStaffModal from "@/components/admin/staff/AddEditStaffModal";
import StaffDetailsModal from "@/components/admin/staff/StaffDetailsModal";

export default function StaffPage() {
  const { setMobileOpen } = useMobileMenu();

  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_MOCK_STAFF);

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const counts: StaffCounts = useMemo(() => {
    return {
      total: staffList.length,
      active: staffList.filter((m) => m.status === "Active").length,
      inactive: staffList.filter((m) => m.status === "Inactive").length,
      managers: staffList.filter(
        (m) => m.role.toLowerCase().includes("manager") || m.role.toLowerCase().includes("lead")
      ).length,
    };
  }, [staffList]);

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

  const handleDeleteStaff = (staff: StaffMember) => {
    setStaffList((prev) => prev.filter((m) => m.id !== staff.id));
    if (selectedStaff && selectedStaff.id === staff.id) {
      setSelectedStaff(null);
      setIsDetailsModalOpen(false);
    }
  };

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 max-w-7xl w-full flex flex-col justify-start">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
              Staff Management
            </h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Staff</span>
          </button>
        </div>

        <StaffSummaryCards counts={counts} />

        <StaffTable
          staffList={staffList}
          onViewStaff={handleOpenView}
          onEditStaff={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDeleteStaff={handleDeleteStaff}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </main>

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
        onDelete={handleDeleteStaff}
      />

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
