"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import SummaryCards from "@/components/admin/SummaryCards";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";

export default function AdminDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white antialiased selection:bg-[#640C0C]/40 selection:text-white">
      {/* Fixed Desktop / Off-canvas Mobile Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <AdminHeader onToggleMobile={() => setMobileOpen((prev) => !prev)} />

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-8 max-w-7xl w-full">
          {/* Dashboard Summary Cards */}
          <SummaryCards />

          {/* Recent Orders Section */}
          <RecentOrdersTable />
        </main>
      </div>
    </div>
  );
}