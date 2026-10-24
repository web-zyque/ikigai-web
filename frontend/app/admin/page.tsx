"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";

import { useMobileMenu } from "@/app/admin/layout";
import SummaryCards from "@/components/admin/SummaryCards";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import OrdersOverviewChart from "@/components/admin/dashboard/OrdersOverviewChart";

export default function AdminDashboardPage() {
  const { setMobileOpen } = useMobileMenu();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#640C0C] lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
            Dashboard
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        {/* 1. Dashboard Summary Cards */}
        <SummaryCards />

        {/* 2. Orders Analytics / Orders Overview Graph */}
        <OrdersOverviewChart />

        {/* 3. Recent Orders Section */}
        <RecentOrdersTable />
      </main>
    </>
  );
}
