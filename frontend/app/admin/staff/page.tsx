"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { useMobileMenu } from "@/contexts/admin-layout-context";
import type { StaffMember, StaffFormData } from "@/types/staff.types";
import StaffSummaryCards, { type StaffCounts } from "@/components/admin/staff/StaffSummaryCards";
import StaffTable from "@/components/admin/staff/StaffTable";
import AddEditStaffModal from "@/components/admin/staff/AddEditStaffModal";
import StaffDetailsModal from "@/components/admin/staff/StaffDetailsModal";
import { staffService, type StaffRecord } from "@/services/staff.service";
import { useToastStore } from "@/stores/toast-store";

const mapStaff = (record: StaffRecord): StaffMember => ({
  id: record.id,
  name: record.fullName,
  email: record.email,
  phone: record.phone ?? "",
  address: "",
  role: "Staff",
  joinDate: record.createdAt,
  status: record.isActive ? "Active" : "Inactive",
});

export default function StaffPage() {
  const { setMobileOpen } = useMobileMenu();
  const addToast = useToastStore((state) => state.addToast);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(async () => {
    try { setStaffList((await staffService.list()).map(mapStaff)); }
    catch (error) { addToast(error instanceof Error ? error.message : "Could not load staff.", "error"); }
  }, [addToast]);
  useEffect(() => { void refresh(); }, [refresh]);

  const counts: StaffCounts = useMemo(() => ({ total: staffList.length, active: staffList.filter((m) => m.status === "Active").length, inactive: staffList.filter((m) => m.status === "Inactive").length, managers: 0 }), [staffList]);
  const handleOpenAdd = () => { setStaffToEdit(null); setIsAddEditModalOpen(true); };
  const handleOpenEdit = (staff: StaffMember) => { setStaffToEdit(staff); setIsAddEditModalOpen(true); };
  const handleDeleteStaff = async (staff: StaffMember) => {
    if (!window.confirm(`Delete ${staff.name}'s staff account?`)) return;
    try { await staffService.remove(staff.id); addToast("Staff account deleted."); await refresh(); setIsDetailsModalOpen(false); setSelectedStaff(null); }
    catch (error) { addToast(error instanceof Error ? error.message : "Could not delete staff.", "error"); }
  };
  const handleToggleStatus = async (staffId: string) => {
    const staff = staffList.find((member) => member.id === staffId);
    if (!staff) return;
    try { await staffService.update(staffId, { isActive: staff.status !== "Active" }); addToast("Staff status updated."); await refresh(); }
    catch (error) { addToast(error instanceof Error ? error.message : "Could not update staff status.", "error"); }
  };
  const handleSaveStaff = async (data: StaffFormData, staffId?: string) => {
    const payload = { fullName: data.name, email: data.email, phone: data.phone, role: "STAFF" as const, ...(data.password ? { password: data.password } : {}) };
    if (staffId) await staffService.update(staffId, payload);
    else await staffService.create(payload);
    addToast(staffId ? "Staff member updated." : "Staff member created.");
    await refresh();
  };

  return <>
    <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 w-full flex flex-col justify-start">
      <div className="flex items-center justify-between pb-2"><div className="flex items-center gap-4"><button type="button" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Open navigation menu" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] lg:hidden"><Menu className="h-4 w-4" /></button><h1 className="text-xl font-bold text-white lg:hidden">Staff Management</h1></div><button type="button" onClick={handleOpenAdd} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#640C0C] px-4 py-2 text-xs font-semibold text-white"><Plus className="h-4 w-4"/><span>Add Staff</span></button></div>
      <StaffSummaryCards counts={counts}/>
      <StaffTable staffList={staffList} onViewStaff={(staff) => { setSelectedStaff(staff); setIsDetailsModalOpen(true); }} onEditStaff={handleOpenEdit} onToggleStatus={(id) => void handleToggleStatus(id)} onDeleteStaff={(staff) => void handleDeleteStaff(staff)} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery}/>
    </main>
    <StaffDetailsModal staff={selectedStaff} isOpen={isDetailsModalOpen} onClose={() => { setIsDetailsModalOpen(false); setSelectedStaff(null); }} onEdit={handleOpenEdit} onToggleStatus={(id) => void handleToggleStatus(id)} onDelete={(staff) => void handleDeleteStaff(staff)}/>
    <AddEditStaffModal isOpen={isAddEditModalOpen} onClose={() => { setIsAddEditModalOpen(false); setStaffToEdit(null); }} onSave={handleSaveStaff} staffToEdit={staffToEdit}/>
  </>;
}
