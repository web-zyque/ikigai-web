"use client";

import React from "react";
import { Menu } from "lucide-react";

import { useMobileMenu } from "@/app/admin/layout";
import SummaryCards from "@/components/admin/SummaryCards";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import OrdersOverviewChart from "@/components/admin/dashboard/OrdersOverviewChart";

export default function AdminDashboardPage() {
  const { setMobileOpen } = useMobileMenu();

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 max-w-7xl w-full flex flex-col justify-start">
        {/* Mobile Header / Sidebar Toggle */}
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
              Dashboard
            </h1>
          </div>
        </div>

        {/* 1. Dashboard Summary Cards */}
        <SummaryCards />

        {/* 2. Orders Analytics / Orders Overview Graph 
        <OrdersOverviewChart /> */}

        {/* 3. Recent Orders Section */}
        <RecentOrdersTable />
      </main>
    </>
  );
}
