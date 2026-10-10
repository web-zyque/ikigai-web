"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";

import SummaryCards from "@/components/admin/SummaryCards";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import AdminSidebar from "@/components/admin/sidebar/Sidebar";
import OrdersOverviewChart from "@/components/admin/dashboard/OrdersOverviewChart";

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
              <h1 className="text-xl font-bold tracking-tight text-white">Dashboard</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-8 max-w-7xl w-full">
          {/* 1. Existing Dashboard Summary Cards */}
          <SummaryCards />

          {/* 2. Orders Analytics / Orders Overview Graph */}
          <OrdersOverviewChart />

          {/* 3. Existing Recent Orders Section */}
          <RecentOrdersTable />
        </main>
      </div>
    </div>
  );
}