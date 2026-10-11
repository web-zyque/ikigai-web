"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { useMobileMenu } from "@/app/admin/layout";
import { ReportTab, DateFilterType } from "@/types/reports.types";
import { MOCK_REPORTS_DATA } from "@/data/mockReports";
import { exportToPdf } from "@/utils/exportPdf";
import ReportsHeader from "@/components/admin/reports/ReportsHeader";
import SalesReportView from "@/components/admin/reports/SalesReportView";
import InventoryReportView from "@/components/admin/reports/InventoryReportView";
import OrdersReportView from "@/components/admin/reports/OrdersReportView";
import RevenueReportView from "@/components/admin/reports/RevenueReportView";

export default function ReportsPage() {
  const { setMobileOpen } = useMobileMenu();

  // Tab & Date filter state
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("last7days");
  const [customStartDate, setCustomStartDate] = useState("2026-10-01");
  const [customEndDate, setCustomEndDate] = useState("2026-10-11");

  // Get corresponding dataset
  const reportData = MOCK_REPORTS_DATA[dateFilter] || MOCK_REPORTS_DATA.last7days;

  // PDF Export logic for active tab
  const handleExportPDF = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const dateRangeLabel =
      dateFilter === "today"
        ? "Today"
        : dateFilter === "last7days"
        ? "Last 7 Days"
        : dateFilter === "thisMonth"
        ? "This Month"
        : `${customStartDate} to ${customEndDate}`;

    switch (activeTab) {
      case "sales": {
        const points =
          reportData.salesTrends.monthly.length > 0
            ? reportData.salesTrends.monthly
            : reportData.salesTrends.daily;

        const headers = [
          "Interval",
          "Timeline",
          "Orders Placed",
          "Sales Volume",
          "Avg Order Value",
        ];
        const rows = points.map((p) => [
          p.label,
          p.fullDate,
          p.orders,
          `INR ${p.sales.toLocaleString("en-IN")}`,
          `INR ${(p.orders > 0 ? Math.round(p.sales / p.orders) : 0).toLocaleString("en-IN")}`,
        ]);

        exportToPdf({
          title: "IKIGAI AUTO PARTS & ACCESSORIES",
          subtitle: "Sales Performance & Velocity Report",
          dateRange: dateRangeLabel,
          metrics: [
            {
              label: "Total Gross Sales",
              value: `INR ${reportData.metrics.totalSales.toLocaleString("en-IN")}`,
            },
            {
              label: "Orders Placed",
              value: `${reportData.metrics.totalOrders} Orders`,
            },
            {
              label: "Avg Order Value",
              value: `INR ${reportData.metrics.avgOrderValue.toLocaleString("en-IN")}`,
            },
          ],
          headers,
          rows,
          filename: `ikigai-sales-report-${dateFilter}-${timestamp}.pdf`,
        });
        break;
      }

      case "inventory": {
        const headers = [
          "SKU",
          "Product Name",
          "Category",
          "Units Sold",
          "Revenue",
          "Stock",
          "Status",
        ];
        const rows = reportData.bestSellers.map((item) => [
          item.sku,
          item.name,
          item.category,
          item.unitsSold,
          `INR ${item.revenue.toLocaleString("en-IN")}`,
          item.stock,
          item.status,
        ]);

        exportToPdf({
          title: "IKIGAI AUTO PARTS & ACCESSORIES",
          subtitle: "Products & Inventory Health Report",
          dateRange: dateRangeLabel,
          metrics: [
            {
              label: "Catalog Items",
              value: `${reportData.metrics.totalProducts} Items`,
            },
            {
              label: "Low Stock Alert",
              value: `${reportData.metrics.lowStockProducts} Items`,
            },
            {
              label: "Out of Stock",
              value: `${reportData.metrics.outOfStockProducts} Items`,
            },
          ],
          headers,
          rows,
          filename: `ikigai-inventory-report-${dateFilter}-${timestamp}.pdf`,
        });
        break;
      }

      case "orders": {
        const headers = [
          "Status Category",
          "Orders Count",
          "Share (%)",
          "Gross Value",
        ];
        const rows = reportData.ordersBreakdown.map((row) => [
          row.status,
          row.count,
          `${row.percentage}%`,
          `INR ${row.totalValue.toLocaleString("en-IN")}`,
        ]);

        exportToPdf({
          title: "IKIGAI AUTO PARTS & ACCESSORIES",
          subtitle: "Orders & Fulfillment Report",
          dateRange: dateRangeLabel,
          metrics: [
            {
              label: "Total Orders",
              value: `${reportData.metrics.totalOrders} Orders`,
            },
            {
              label: "Completed",
              value: `${reportData.metrics.completedOrders} Orders`,
            },
            {
              label: "Cancelled",
              value: `${reportData.metrics.cancelledOrders} Orders`,
            },
          ],
          headers,
          rows,
          filename: `ikigai-orders-report-${dateFilter}-${timestamp}.pdf`,
        });
        break;
      }

      case "revenue": {
        const headers = [
          "Payment Method",
          "Transactions",
          "Collected Revenue",
          "Volume Share",
        ];
        const rows = reportData.paymentBreakdown.map((row) => [
          row.method,
          row.transactions,
          `INR ${row.amount.toLocaleString("en-IN")}`,
          `${row.percentage}%`,
        ]);

        exportToPdf({
          title: "IKIGAI AUTO PARTS & ACCESSORIES",
          subtitle: "Revenue & Payment Methods Summary",
          dateRange: dateRangeLabel,
          metrics: [
            {
              label: "Total Gross Revenue",
              value: `INR ${reportData.metrics.totalRevenue.toLocaleString("en-IN")}`,
            },
            {
              label: "Paid Transactions",
              value: `${reportData.metrics.totalOrders} Txns`,
            },
            {
              label: "Avg Transaction Size",
              value: `INR ${reportData.metrics.avgOrderValue.toLocaleString("en-IN")}`,
            },
          ],
          headers,
          rows,
          filename: `ikigai-revenue-report-${dateFilter}-${timestamp}.pdf`,
        });
        break;
      }
    }
  };

  return (
    <>
      {/* Top Header bar with mobile menu toggle */}
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
            <h1 className="text-xl font-bold tracking-tight text-white">Reports</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 lg:px-12 py-8 space-y-6 max-w-7xl w-full">
        {/* Reports Header with Date Filter & Tab Switcher */}
        <ReportsHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          customStartDate={customStartDate}
          onCustomStartDateChange={setCustomStartDate}
          customEndDate={customEndDate}
          onCustomEndDateChange={setCustomEndDate}
          onExportPDF={handleExportPDF}
        />

        {/* Tab 1: Sales Report */}
        {activeTab === "sales" && <SalesReportView data={reportData} />}

        {/* Tab 2: Products & Inventory Report */}
        {activeTab === "inventory" && <InventoryReportView data={reportData} />}

        {/* Tab 3: Orders Report */}
        {activeTab === "orders" && <OrdersReportView data={reportData} />}

        {/* Tab 4: Revenue Summary */}
        {activeTab === "revenue" && <RevenueReportView data={reportData} />}
      </main>
    </>
  );
}
