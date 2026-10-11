"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StaffMember, StaffRole, StaffStatus, STAFF_ROLES } from "@/types/staff.types";

export interface StaffTableProps {
  staffList: StaffMember[];
  onViewStaff: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  onToggleStatus: (staffId: string) => void;
}

export default function StaffTable({
  staffList,
  onViewStaff,
  onEditStaff,
  onToggleStatus,
}: StaffTableProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Filter logic
  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return staffList.filter((member) => {
      // 1. Role filter
      if (selectedRole !== "All" && member.role !== selectedRole) {
        return false;
      }

      // 2. Status filter
      if (selectedStatus !== "All" && member.status !== selectedStatus) {
        return false;
      }

      // 3. Search query (matches Name, ID, Phone, Email)
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
  }, [staffList, selectedRole, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + PAGE_SIZE);

  // Helper: Format Date
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

  // Helper: Status badge
  const renderStatusBadge = (status: StaffStatus) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        Inactive
      </span>
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedRole("All");
    setSelectedStatus("All");
    setCurrentPage(1);
  };

  const isFiltered = searchQuery || selectedRole !== "All" || selectedStatus !== "All";

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Table Header Section: Search & Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-white/5 p-6 bg-[#121212]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold tracking-tight text-white">Staff Directory</h3>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                {filteredStaff.length} {filteredStaff.length === 1 ? "Staff" : "Staff Members"}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Search by name, staff ID, role, or filter by active status
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, ID, phone..."
              aria-label="Search staff members"
              className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9.5 pr-8 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-[#640C0C] focus:bg-[#161616]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="staff-role-filter" className="text-xs text-white/40 font-medium">Role:</label>
            <select
              id="staff-role-filter"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white/90 outline-none hover:border-white/20 focus:border-[#640C0C] transition-colors cursor-pointer"
            >
              <option value="All" className="bg-[#121212] text-white">All Roles</option>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#121212] text-white">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="staff-status-filter" className="text-xs text-white/40 font-medium">Status:</label>
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5 text-xs">
              {(["All", "Active", "Inactive"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    selectedStatus === st
                      ? "bg-[#640C0C] text-white shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters Shortcut */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs text-white/40 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff Table Container */}
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Staff ID
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Staff Name
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Phone
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Join Date
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="h-8 w-8 text-white/20 stroke-1" />
                    <p className="text-sm font-medium text-white/70">No staff members found</p>
                    <p className="text-xs text-white/40 max-w-sm">
                      No records match the specified search query or filters.
                    </p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStaff.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-white/[0.02] group"
                >
                  {/* Staff ID */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="font-mono text-white/80 font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px]">
                      {member.id}
                    </span>
                  </td>

                  {/* Staff Name & Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#640C0C]/30 border border-[#640C0C]/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-white/95">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
                      {member.role}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 whitespace-nowrap text-white/70 font-mono text-[11px]">
                    {member.phone}
                  </td>

                  {/* Join Date */}
                  <td className="px-5 py-4 whitespace-nowrap text-white/60">
                    {formatJoinDate(member.joinDate)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {renderStatusBadge(member.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewStaff(member)}
                        title="View Details"
                        aria-label={`View details of ${member.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit Details */}
                      <button
                        type="button"
                        onClick={() => onEditStaff(member)}
                        title="Edit Staff"
                        aria-label={`Edit ${member.name}`}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* Quick Toggle Status */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(member.id)}
                        title={`Toggle status to ${member.status === "Active" ? "Inactive" : "Active"}`}
                        aria-label={`Toggle status for ${member.name}`}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          member.status === "Active"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                      >
                        {member.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredStaff.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 px-6 py-4 bg-[#0a0a0a] text-xs text-white/50">
          <div>
            Showing{" "}
            <span className="font-semibold text-white">
              {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, filteredStaff.length)}
            </span>{" "}
            of <span className="font-semibold text-white">{filteredStaff.length}</span> staff members
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
      )}
    </div>
  );
}
