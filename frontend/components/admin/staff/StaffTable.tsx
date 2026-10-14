"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { StaffMember, StaffStatus, STAFF_ROLES } from "@/types/staff.types";

export interface StaffTableProps {
  staffList: StaffMember[];
  onViewStaff: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  onToggleStatus: (staffId: string) => void;
  onDeleteStaff?: (staff: StaffMember) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  roleFilter?: string;
  onRoleFilterChange?: (role: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export default function StaffTable({
  staffList,
  onViewStaff,
  onEditStaff,
  onToggleStatus,
  onDeleteStaff,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  searchQuery: externalSearchQuery,
  onSearchQueryChange: externalOnSearchQueryChange,
}: StaffTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalRoleFilter, setInternalRoleFilter] = useState<string>("All");
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>("All");
  const [activeMenuStaffId, setActiveMenuStaffId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuStaffId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalOnSearchQueryChange || setInternalSearchQuery;

  const activeRoleFilter = roleFilter !== undefined ? roleFilter : internalRoleFilter;
  const setRoleFilter = onRoleFilterChange || setInternalRoleFilter;

  const activeStatusFilter = statusFilter !== undefined ? statusFilter : internalStatusFilter;
  const setStatusFilter = onStatusFilterChange || setInternalStatusFilter;

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return staffList.filter((member) => {
      if (activeRoleFilter !== "All" && member.role !== activeRoleFilter) {
        return false;
      }

      if (activeStatusFilter !== "All" && member.status !== activeStatusFilter) {
        return false;
      }

      if (query) {
        const matchesName = member.name.toLowerCase().includes(query);
        const matchesId = member.id.toLowerCase().includes(query);
        const matchesEmail = member.email.toLowerCase().includes(query);
        const matchesPhone = member.phone.toLowerCase().includes(query);

        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [staffList, activeRoleFilter, activeStatusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + PAGE_SIZE);

  const formatJoinDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: StaffStatus) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        Inactive
      </span>
    );
  };

  const statusTabs: Array<"All" | "Active" | "Inactive"> = ["All", "Active", "Inactive"];

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-6 py-4 bg-[#121212]">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {statusTabs.map((tab) => {
            const isActive = activeStatusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search staff..."
              aria-label="Search staff"
              className="w-full h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 pl-8.5 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            id="staff-role-filter"
            value={activeRoleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by role"
            className="h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30 cursor-pointer transition-colors"
          >
            <option value="All" className="bg-[#121212] text-white">
              All Roles
            </option>
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role} className="bg-[#121212] text-white">
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Staff ID
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Staff Name
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Join Date
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="h-8 w-8 text-white/20 stroke-1" />
                    <p className="text-sm font-medium text-white/70">No staff members found</p>
                    <p className="text-xs text-white/40 max-w-sm">
                      No records match the specified search query or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStaff.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-white/[0.02] group cursor-pointer"
                  onClick={() => onViewStaff(member)}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-white/60">
                    {member.id}
                  </td>

                  <td className="px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-white/95">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">{member.email}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-white/80">
                    {member.role}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-white/60">
                    {formatJoinDate(member.joinDate)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(member.status)}
                  </td>

                  <td
                    className="px-6 py-4 whitespace-nowrap text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block text-left" ref={activeMenuStaffId === member.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuStaffId((curr) => (curr === member.id ? null : member.id))
                        }
                        aria-label="Open staff actions"
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {activeMenuStaffId === member.id && (
                        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-white/10 bg-[#161616] p-1 shadow-2xl z-50 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStaffId(null);
                              onViewStaff(member);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-white/40" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStaffId(null);
                              onEditStaff(member);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-white/40" />
                            <span>Edit Staff</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuStaffId(null);
                              onToggleStatus(member.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                          >
                            <Power className="h-3.5 w-3.5 text-white/40" />
                            <span>{member.status === "Active" ? "Set Inactive" : "Set Active"}</span>
                          </button>

                          {onDeleteStaff && (
                            <div className="pt-1 mt-1 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuStaffId(null);
                                  onDeleteStaff(member);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Staff</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 px-6 py-3.5 bg-[#0a0a0a] text-xs text-white/50">
        <div>
          Showing {Math.min(paginatedStaff.length, filteredStaff.length)} of{" "}
          {filteredStaff.length} staff
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
