export type ReportTab = "sales" | "inventory" | "orders" | "revenue";

export type DateFilterType = "today" | "last7days" | "thisMonth" | "custom";

export interface SalesTrendPoint {
  label: string;
  fullDate: string;
  sales: number; // in INR
  orders: number;
}

export interface BestSellingProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface OrderStatusBreakdown {
  status: "Delivered" | "Processing" | "Pending" | "Cancelled";
  count: number;
  percentage: number;
  totalValue: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  transactions: number;
  amount: number;
  percentage: number;
}

export interface ReportMetrics {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
